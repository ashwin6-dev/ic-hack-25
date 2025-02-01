#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include "system.h"
#include "altera_up_avalon_accelerometer_spi.h"
#include "altera_avalon_timer_regs.h"
#include "altera_avalon_timer.h"
#include "altera_avalon_pio_regs.h"
#include "sys/alt_irq.h"

#define CHARLIM 256    // Maximum character length of what the user places in memory.  Increase to allow longer sequences
#define QUITLETTER '~' // Letter to kill all processing
#define NUM_TAPS 5
#define Q 16
#define EXPONENT (1 << Q)
#define OFFSET -32
#define PWM_PERIOD 16
#define NUM_TAPS 5

alt_8 pwm = 0;
alt_u8 led;
int level;

void get_mode(char *text, int mode){
    char *printMsg;
    mode = atoi(text);
    asprintf(&printMsg, "<--> Mode selected: %d <-->\n %c", mode, 0x4); // Print out the strings
    alt_putstr(printMsg);
    free(printMsg);
    memset(text, 0, 2 * CHARLIM); // Empty the text buffer for next input
}

char generate_text(char curr, char *text, int *running)
{
    if (curr == '\n')
        return curr; // If the line is empty, return nothing.
    int idx = 0;     // Keep track of how many characters have been sent down for later printing
    char newCurr = curr;

    while (newCurr != EOF && newCurr != '\n')
    { // Keep reading characters until we get to the end of the line
        if (newCurr == QUITLETTER)
        {
            *running = 0;
        }                        // If quitting letter is encountered, setting running to 0
        text[idx] = newCurr;     // Add the next letter to the text buffer
        idx++;                   // Keep track of the number of characters read
        newCurr = alt_getchar(); // Get the next character
    }

    return newCurr;
}

int read_chars(mode)
{
    char text[2 * CHARLIM]; // The buffer for the printing text
    char prevLetter = '!';
    int length = 0;
    int running = 1;

    while (running)
    {                                                                    // Keep running until QUITLETTER is encountered
        prevLetter = alt_getchar();                                      // Extract the first character (and create a hold until one arrives)
        prevLetter = generate_text(prevLetter, text, &running); // Process input text
        get_mode(text, length, mode);                                    // Print input text
    }

    return 0;
}

void led_write(alt_u8 led_pattern) {
    IOWR(LED_BASE, 0, led_pattern);
}

void convert_read(alt_32 acc_read, int * level, alt_u8 * led) {
    acc_read += OFFSET;
    alt_u8 val = (acc_read >> 6) & 0x07;
    * led = (8 >> val) | (8 << (8 - val));
    * level = (acc_read >> 1) & 0x1f;
}

void sys_timer_isr() {
    IOWR_ALTERA_AVALON_TIMER_STATUS(TIMER_BASE, 0);

    if (pwm < abs(level)) {

        if (level < 0) {
            led_write(led << 1);
        } else {
            led_write(led >> 1);
        }

    } else {
        led_write(led);
    }

    if (pwm > PWM_PERIOD) {
        pwm = 0;
    } else {
        pwm++;
    }

}

void timer_init(void * isr) {

    IOWR_ALTERA_AVALON_TIMER_CONTROL(TIMER_BASE, 0x0003);
    IOWR_ALTERA_AVALON_TIMER_STATUS(TIMER_BASE, 0);
    IOWR_ALTERA_AVALON_TIMER_PERIODL(TIMER_BASE, 0x0900);
    IOWR_ALTERA_AVALON_TIMER_PERIODH(TIMER_BASE, 0x0000);
    alt_irq_register(TIMER_IRQ, 0, isr);
    IOWR_ALTERA_AVALON_TIMER_CONTROL(TIMER_BASE, 0x0007);

}

float fir_filter(float current_reading) {
	static float buffer[NUM_TAPS] = {0};
	static int buffer_index = 0;
	float coefficients[NUM_TAPS] = {0.2, 0.2, 0.2, 0.2, 0.2};
	float output = 0.0;

	buffer[buffer_index] = current_reading;

	for (int i = 0; i < NUM_TAPS; i++) {
		output += coefficients[i] * buffer[(buffer_index - i + NUM_TAPS) % NUM_TAPS];
	}

	buffer_index = (buffer_index + 1) % NUM_TAPS;

	return output;
}

int32_t fir_filter_fixed(int32_t current_reading) {

    static int32_t buffer[NUM_TAPS] = {0};
    static int buffer_index = 0;

    const int32_t coefficients[NUM_TAPS] = {
        (int32_t)(0.2 * EXPONENT),
        (int32_t)(0.2 * EXPONENT),
        (int32_t)(0.2 * EXPONENT),
        (int32_t)(0.2 * EXPONENT),
        (int32_t)(0.2 * EXPONENT)
    };

    buffer[buffer_index] = current_reading;

    int64_t output = 0;
    for (int i = 0; i < NUM_TAPS; i++) {
        output += (int64_t)coefficients[i] * buffer[(buffer_index - i + NUM_TAPS) % NUM_TAPS];
    }

    buffer_index = (buffer_index + 1) % NUM_TAPS;
    return (int32_t)(output / EXPONENT);
}

int main()
{
	alt_32 x_read;
	alt_up_accelerometer_spi_dev * acc_dev;
	acc_dev = alt_up_accelerometer_spi_open_dev("/dev/accelerometer_spi");
	if (acc_dev == NULL) { // if return 1, check if the spi ip name is "accelerometer_spi"
		return 1;
	}
	timer_init(sys_timer_isr);
	int mode = 0;
    read_chars(mode);
    while (1) {
    	alt_up_accelerometer_spi_read_x_axis(acc_dev, & x_read);
    	//        alt_printf("raw data: %x\n", x_read);
    	switch (mode) {
    	case 0:
    		int32_t filtered_reading = x_read;
    	case 1:
    		int32_t filtered_reading = fir_filter(x_read);
    	case 2:
    		int32_t filtered_reading = fir_filter_fixed(x_read);
    	default:
    		int32_t filtered_reading = x_read;
    	}
    	convert_read(filtered_reading, & level, & led);
    }
}
