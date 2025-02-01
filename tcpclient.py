import socket

server_ip = '172.30.175.182'  # Replace with your server's actual IP
port = 12345

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((server_ip, port))

print("Connected to server. Type 'exit' to quit.")

while True:
    # Get custom message from user
    message = input("Enter message to send to server: ")
    
    # Send message to server
    client_socket.send(message.encode())

    if message.lower() == "exit":
        break  # Exit when user types "exit"

    # Receive and print server's response
    response = client_socket.recv(1024).decode()
    print(f"Server: {response}")

print("Closing connection.")
client_socket.close()