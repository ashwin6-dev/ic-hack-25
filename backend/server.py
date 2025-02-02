from flask import Flask, jsonify, request
from flask_cors import CORS
from profile_builder import ProfileBuilder
from profile_rag import ProfileRag
import os
from dotenv import load_dotenv
from pinecone import Pinecone
# from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings


load_dotenv()

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
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

    return jsonify(message=profile_rag.query(query))

if __name__ == '__main__':
    app.run(debug=True)
