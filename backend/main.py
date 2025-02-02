from flask import Flask, jsonify, request
from flask_cors import CORS
from profile_builder import ProfileBuilder
from profile_rag import ProfileRag
import os
import subprocess
import time
import socket
from dotenv import load_dotenv
from pinecone import Pinecone
# from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings


load_dotenv()

# PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_API_KEY = "pcsk_Xbf85_ChpsQ4mHZmuLwnCGUYCbtsyAWWodPFKdeEKTxQppq1mAzoXURXTGo1Xw7BucJ8o"
INDEX_NAME = "echo-app"

app = Flask(__name__)
CORS(app)

pc = Pinecone(api_key=PINECONE_API_KEY)
pc_index = pc.Index(name=INDEX_NAME)

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

profile_builder = ProfileBuilder()
profile_rag = ProfileRag()
profile_rag.set_pc_index(pc_index)
profile_rag.set_embedding_model(embedding_model)

def send_and_receive(cmd):
    process = subprocess.Popen(
        ["nios2-terminal"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    time.sleep(2)  

    try:
        process.stdin.write(cmd + "\n")
        process.stdin.flush()

        response = []
        start_time = time.time()
        while True:
            line = process.stdout.readline().strip()
            if line:
                response.append(line)
            if "FPGA received" in line: 
                break
            if time.time() - start_time > 2:  # Timeout to prevent infinite loops
                break

        process.terminate()  
        return "\n".join(response)

    except OSError as e:
        print(f"Error: {e}")
        process.terminate()
        return "Communication failed"

@app.route("/build_profile", methods=["POST"])
def build_profile():
    data = request.get_json()
    name = data["name"]
    video_urls = data["video_urls"]

    profile_builder.custom_profile_build(name, video_urls=video_urls)

    return jsonify(message="Profile built successfully", name=name, video_urls=video_urls)

@app.route("/query_profile", methods=["POST"])
def query_profile():
    data = request.get_json()
    name = data["name"]
    query = data["query"]

    profile_rag.set_profile_name(name)
    response = profile_rag.query(query)

    return jsonify(message=response)

@app.route("/send_fpga", methods=["POST"])
def send_fpga():
    data = request.get_json()
    command = data["command"]

    fpga_response = send_and_receive(command)

    return jsonify(fpga_response=fpga_response)

def start_fpga_server():
    # host = '192.168.129.113' 
    host = '127.0.0.1'
    port = 12345

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((host, port))
    server_socket.listen(1)

    print(f"FPGA Server listening on {host}:{port}...")
    client_socket, client_address = server_socket.accept()
    print(f"Connected to {client_address}")

    while True:
        msg = client_socket.recv(1024).decode()
        if msg.lower() == "exit":
            break

        response = send_and_receive(msg)
        print(f"Response from FPGA: {response}")

        client_socket.send(response.encode())

    print("Closing FPGA connection.")
    client_socket.close()
    server_socket.close()

# Main Entry Point
if __name__ == '__main__':
    # Run Flask API in a separate thread
    import threading
    api_thread = threading.Thread(target=app.run, kwargs={'debug': True, 'use_reloader': False})
    api_thread.start()

    # Start FPGA Communication Server
    start_fpga_server()
