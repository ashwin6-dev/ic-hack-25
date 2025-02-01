import socket

# Define the host and port
host = '127.0.0.1'  # Localhost
port = 12345         # Port number

# Create a TCP/IP socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the address and port
server_socket.bind((host, port))

# Enable the server to accept connections (with a backlog of 5)
server_socket.listen(5)

print(f"Server started at {host}:{port}. Waiting for connections...")

# Accept client connections in an infinite loop
while True:
    # Wait for a connection
    client_socket, client_address = server_socket.accept()
    print(f"Connection from {client_address} established.")

    # Send a welcome message to the client
    client_socket.send(b"Hello, client! You are connected to the server.\n")

    # Receive data from the client
    data = client_socket.recv(1024)
    if data:
        print(f"Received from client: {data.decode()}")

    # Close the connection
    client_socket.close()
    print(f"Connection from {client_address} closed.")
