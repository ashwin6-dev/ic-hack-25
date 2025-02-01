import subprocess

NIOS_CMD_SHELL_BAT = "C:/intelFPGA_lite/18.1/nios2eds/Nios II Command Shell.bat"

def send_on_jtag(cmd):
    # check if atleast one character is being sent down
    assert (len(cmd) >= 1), "Please make the cmd a single character"

    # create a subprocess which will run the nios2-terminal
    process = subprocess.Popen(
        NIOS_CMD_SHELL_BAT,
        bufsize=0,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
    )

    # send the cmd string to the nios2-terminal, read the output and terminate the process
    try:
        vals, err = process.communicate(
            bytes("nios2-terminal <<< {}".format(cmd), "utf-8")
        )
        process.terminate()
    except subprocess.TimeoutExpired:
        vals = "Failed"
        process.terminate()
    return vals

def perform_computation():
    res = send_on_jtag("testing")
    # you can process the output here
    print(res)


def main():
    perform_computation()


if __name__ == "__main__":
    main()
