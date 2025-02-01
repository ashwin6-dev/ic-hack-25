import wikipedia
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=40
)

class ProfileBuilder:
    def __init__(self):
        self.index_name = None
        self.embedding_model = None

    def set_pc_name(self, index_name):
        self.index_name = index_name

    def set_embedding_model(self, embedding_model):
        self.embedding_model = embedding_model

    def fetch_wikipedia_page(self, name, extra_info = ""):
        page = wikipedia.page(f"{name} {extra_info}")
        content = page.content
        docs = text_splitter.split_text([content])

        return docs

    def get_video_transcript(self, video_url):
        video_id = video_url.split("v=")[1]
        
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            transcript_string = ""

            for chunk in transcript:
                transcript_string += chunk["text"] + " "

            return text_splitter.split_text([transcript_string])

        except Exception as e:
            return f"Error fetching transcript: {e}"
        
    def custom_profile_build(self, name, video_urls = []):
        profile_docs = self.fetch_wikipedia_page(name)

        for url in video_urls:
            docs = self.get_video_transcript(url)
            profile_docs = profile_docs + docs
        
        PineconeVectorStore.from_documents(
            documents=profile_docs,
            index_name=self.index_name,
            embedding=self.embedding_model,
            namespace=name
        )