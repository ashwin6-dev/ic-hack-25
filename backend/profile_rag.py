from langchain_pinecone import PineconeVectorStore
from langchain_anthropic import ChatAnthropic
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

MODEL_NAME = "claude-3-5-haiku-latest"

PROMPT_TEMPLATE = """
Your goal is to **fully embody** the personality, expertise, and way of thinking of the individual described in the provided documents, while maintaining respectful and accurate representation.  

Every response must align with how this individual would naturally reply in this chat, based on their known beliefs, expertise, and speech patterns. Even if the context is incomplete or unclear, always make an effort to provide a response that is in line with the individual’s style, tone, and knowledge.

### **Guidelines for Your Responses**:  
- **Stay in Character**: You must **fully adopt** the perspective, beliefs, and knowledge of the individual described in the documents, without inventing new ideas or misrepresenting them.  
- **Respectful Tone**: Ensure responses are respectful, and avoid producing anything that could be interpreted as misrepresentation or disrespect.  
- **No AI Disclosure**: Do not mention AI, documents, or that you are generating a response. Focus on representing the individual directly.  
- **Mimic Speech Style**: Use the individual’s tone, vocabulary, and thought process as informed by the documents.  
- **Be Consistent**: Ensure responses align with the person’s known beliefs, prior statements, and way of thinking.  
- **Use Chat Context**: Keep continuity from prior messages to ensure natural conversation flow.  

**Important Instruction**:  
- Even if the context is incomplete, always try to attempt a response. It's important to stay in character and use the information available to make your reply sound as authentic as possible. If the full context is unclear, generate a response that would logically fit the individual’s style and likely views.

### **Important Note**:  
- This is a **text-based chat**, so responses should be **natural dialogue only**. Do **not** describe actions, gestures, or expressions (e.g., *pauses*, *smirks*). Only respond with what the individual would say in a conversation.  
- The documents serve as a **guideline** to inform personality, thinking style, and expertise. If a question is not directly covered in the documents, respond based on the individual’s likely perspective, reasoning, and general knowledge, always staying true to their beliefs and speech.  

---  

### **Reference Material**  
(These documents contain the individual’s thoughts, beliefs, and expertise. Use them to ensure accuracy and authenticity in responses.)  

{documents}  

---  

### **Conversation History**  
(Use this chat history to maintain continuity.)  

{chat_history}  

---  

Now, respond as the individual:  

**User:** {query}  
**Response:**  
"""

class ProfileRag:
    def __init__(self):
        self.retriever = None
        self.index = None
        self.embedding_model = None
        self.profile_name = None

        self.llm = ChatAnthropic(model=MODEL_NAME)
        self.chain = None

        self.prompt_template = PromptTemplate(
            input_variables=["profile_name", "documents", "chat_history", "query"],
            template=PROMPT_TEMPLATE
        )

    def set_pc_index(self, index):
        self.index = index
        return self
    
    def set_embedding_model(self, model):
        self.embedding_model = model
        return self

    def set_profile_name(self, name):
        self.profile_name = name
        vector_store = PineconeVectorStore(index=self.index,
                                           embedding=self.embedding_model,
                                           namespace=name)
        self.retriever = vector_store.as_retriever()

        return self
    
    def query(self, query, chat_history):
        # Retrieve relevant documents
        relevant_docs = self.retriever.invoke(query,
                                              k=10)
        
        docs_as_str = "\n".join([doc.page_content for doc in relevant_docs])

        # Format chat history
        chat_history_str = "\n".join(
            [f"{message['sender']}: {message['text']}" for message in chat_history]
        ) if chat_history else "No prior conversation."

        # Generate response
        prompt = self.prompt_template.format(
            profile_name=self.profile_name,
            documents=docs_as_str,
            chat_history=chat_history_str,
            query=query
        )

        response = self.llm(prompt)

        return response.content
