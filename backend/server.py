from flask import Flask, jsonify, request
from flask_cors import CORS
from profile_builder import ProfileBuilder
from profile_rag import ProfileRag
import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain.embeddings import HuggingFaceEmbeddings

load_dotenv()

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
INDEX_NAME = "echo-app"
NAMESPACES_FILE = "namespaces.txt"  # File storing profile names and descriptions

app = Flask(__name__)
CORS(app)

pc = Pinecone(api_key=PINECONE_API_KEY)
pc_index = pc.Index(name=INDEX_NAME)

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

profile_builder = ProfileBuilder()
profile_builder.set_index_name(INDEX_NAME)
profile_builder.set_embedding_model(embedding_model)

profile_rag = ProfileRag()
profile_rag.set_pc_index(pc_index)
profile_rag.set_embedding_model(embedding_model)

# Ensure namespaces.txt exists
if not os.path.exists(NAMESPACES_FILE):
    open(NAMESPACES_FILE, "w").close()  # Create an empty file if it doesn't exist


@app.route("/build_profile", methods=["POST"])
def build_profile():
    data = request.get_json()
    name = data["name"].strip()
    desc = data["description"].strip()
    video_urls = data["video_urls"]

    profile_builder.custom_profile_build(name, video_urls=video_urls)

    # Read existing profiles
    with open(NAMESPACES_FILE, "r") as f:
        profiles = [line.strip().split(", ", 1) for line in f.readlines() if line.strip()]

    # Check if profile already exists
    if not any(existing_name == name for existing_name, _ in profiles):
        with open(NAMESPACES_FILE, "a") as f:
            f.write(f"{name}, {desc}\n")  # Append new profile

    return jsonify(message="Profile built successfully")


@app.route("/query_profile", methods=["POST"])
def query_profile():
    data = request.get_json()
    name = data["name"]
    query = data["query"]
    chat_history = data["chat_history"]

    profile_rag.set_profile_name(name)
    response = profile_rag.query(query, chat_history)

    return jsonify(message=response)


@app.route("/get_profiles", methods=["GET"])
def get_profiles():
    try:
        with open(NAMESPACES_FILE, "r") as f:
            profiles = [
                {"name": name, "description": desc}
                for line in f.readlines()
                if (split_line := line.strip().split(", ", 1)) and len(split_line) == 2
                for name, desc in [split_line]
            ]
        return jsonify(profiles=profiles)
    except Exception as e:
        return jsonify(error=str(e)), 500


if __name__ == "__main__":
    app.run(debug=True)
