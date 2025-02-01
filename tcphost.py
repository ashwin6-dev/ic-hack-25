import socket

host = '172.30.175.182'  # Listen on all available network interfaces
port = 12345

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((host, port))
server_socket.listen(1)

print(f"Server listening on {host}:{port}...")

client_socket, client_address = server_socket.accept()
print(f"Connected to {client_address}")

while True:
    # Receive message from client
    data = client_socket.recv(1024).decode()
    if not data or data.lower() == "exit":  
        break  # Exit when client sends "exit"
    
    print(f"Client: {data}")

    # Send a custom message back
    message = input("Enter message to send to client: ")
    client_socket.send(message.encode())

print("Closing connection.")
client_socket.close()
server_socket.close()
