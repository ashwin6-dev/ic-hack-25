# Hardware branch

## Plan:
| Task | Time
|---|---|
| Single FPGA client host set up | 15:00 |
| Backend hosting | 17:00 |
| Dual FPGA setup | 22:00 |
| Complete system integration + Testing | 03:00 |

### 1. Single FPGA client host set up:
Following lab 4 to replicate that first, then changing the Nios 2 hardware as required. 
>[!ERROR]
>Current issue is that conenction halts very quickly - after 1 command of `nios2-terminal.exe`
>Figure out to keep this active
>Also Quartus file for longer than a set amount of time. 

### 2. Edit python host file for communication flask 

### 3. gotta figure this out later ...


## Design Decisions/Processg:
### Off-chip memory
This is any memory not on the same board as the main CPU such as:
- DDR (RAM) Memory
- Graphics (GDDR) Memory - for GPUs
- HBM Memory - High Bandwidth Memory designed for GPUs. This is more expensive but offers higher bandwidth and is more power efficient.
On chip memory is covered by:
- Instruction and Data cache
- on-chip SRAM

High Bandwidth Memory is vertically stacked DRAM memory interconnected by Through-Silicon Vias (TSVs) which are vertical electrical connections tat run through the silicon dies to enable high speed communication.
The base die is a Logic die that contains the logic circuitry for memory control and data routing and this manages tasks such as error correction, data buffering ,timing control.
The physical layer acts as the interface between the HBM stack ad logic die connecting to the interposer which links to the CPU/GPU/SoC Die.
This is all hosted on a physical base, the package substrate for the motherboard/system level PCB.

![](../lab4/images/HBM.png)

Each HBM stack has a wide memory interface with thousands of bits per transfer, so higher bandwidth at lower clock speeds. This is often 1024 bits per stack (HBM2) vs 64 bits per channel (DDR4). Further the vertical stacking and using microbumps means there is a shorter path between each HBM die rather than DDR RAM which is physically located away and a single layer.

This results in a bandwidth of up to 256GBps (HBM2) vs 25.6GBps (DDR4).
### UART communication
Further to the background in the previous lab: [./lab3-docs](./lab3-docs)

UART is used for device to device communication and uses 2 wires. This operates at an agreed frequency of reading known as baud rate.

|     1     |    5-9     |     0-1     |    1-2    |
| :-------: | :--------: | :---------: | :-------: |
| Start Bit | Data Frame | Parity Bits | Stop Bits |

---
## UART communication with NIOS
We are provided with a design that allows NIOS II to communicate with the host PC via UART, with the addition of off-chip memory.
This system also includes a PLL (Phase Locked Loop) which generates a signal whose phase is related to an input signal.
As signals to/from off-chip memory exhibit delays, a phase shift is used to drive the off-chip memory related to NIOS II for the data to be registered for a full clock cycle.

Looking through this provided design, we see that `jtag-uart-test` has a `hello_world.qpf` file that contains a schematic, `hello_world.bdf` along with a `.qsys` file for system configuration, `.qip` and `.sip` files for the PLLs.

>[!NOTE]
>A `*.bdf` file is a Block Diagram File with a visual format rather than HDL

The block diagram shows that the system is clock driver by `iCLK` and also has a buffer `clk_sip` for the SDRAM and CPU. The SDRAM contains interface signals/Busses for Addressing, Data, Control and Clock (synchronisation).
There is also an output to the LEDs in addition to `PIN_J21` and `PIN_V22` which may be connected to external hardware.
![](../lab4/images/hello-world-bdf.png)

Looking at the `.qsys` file will give us more information on the system hardware:
![](../lab4/images/cpu-qsys.png)

The host program:
- sends signals to the board
- waits for a response
- processes the response
This puts the NIOS into slave mode.
The board side will:
- read incoming characters
- A running variable ensures this runs indefinitely until QUITLETTER is received. QUITLETTER is a constant which is `~` in this case.
- Inside the while loop, `alt_getchar()` reads a single character from the jtag_uart port and stalls until a new character arrives.
- The first character fills the text buffer and is checked for the quitting character
- This is then added to the buffer and text index pointer is incremented, continuing until a newline character (`\n`) is encountered.
- The text is then printed back to the host terminal and a string ending in `0x4` or `Ctrl+D`  is generated and sent to the host for signal termination.
- The text buffer is then cleared for the next input .

We can start the board side by first running `hello_world_time_limited.sof` via Programmer. This runs for 1 hour.

