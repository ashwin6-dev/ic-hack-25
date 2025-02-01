import subprocess

NIOS_CMD_SHELL_BAT = "C:/intelFPGA_lite/18.1/nios2eds/Nios II Command Shell.bat"

def send_on_jtag():
    # Start the Nios II Command Shell
    process = subprocess.Popen(
        NIOS_CMD_SHELL_BAT,  # Run the shell
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0
    )

    print("Connected to Nios II. Type 'exit' to quit.")

    while True:
        value = input("Enter input: ")

        if value.lower() == "exit":
            print("Exiting...")
            process.terminate()  # Kill the process
            break

        if len(value) < 1:
            print("Error: Please enter at least one character.")
            continue
            
        try:
            vals, err = process.communicate(
                bytes(f"nios2-terminal <<< {value}", "utf-8")
            )
            process.terminate()
        except subprocess.TimeoutExpired:
            vals = "Failed"
            process.terminate()
    
        # Send the value to Nios II Terminal
        process.stdin.write(f"nios2-terminal <<< {value}\n")
        process.stdin.flush()

        # Read output from the Nios II terminal
        output = process.stdout.readline()
        print(f"Nios II Response: {output.strip()}")

def main():
    send_on_jtag()

if __name__ == "__main__":
    main()
