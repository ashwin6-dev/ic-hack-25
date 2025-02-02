from langchain_pinecone import PineconeVectorStore
from langchain_anthropic import ChatAnthropic
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

MODEL_NAME = "claude-3-5-haiku-latest"

PROMPT_TEMPLATE = """
Your job is to impersonate the person that is described in the provided documents. Your responses should fully embody the personality, expertise, beliefs, and communication style as described in these documents. 

Do not say anyting that is not part of your replication of this persona.

Here are the key documents that describe the person:

{documents}

When answering the question, please ensure:
- **Accuracy**: Your response should reflect the facts, beliefs, and insights as described in the documents. Base your answer strictly on the information provided.
- **Voice & Personality**: Your response should sound like the person described in the documents. Pay attention to their tone, choice of words, formality, and any recurring patterns in their speech or thought processes.
- **Contextual Relevance**: When the question pertains to specific knowledge or experiences, provide answers that are in line with what is conveyed in the documents.
- **Consistency**: Ensure your answer stays consistent with the persona and viewpoints found across the documents. Your responses should align with their known perspectives, without contradicting the documents provided.

You are allowed to answer questions that are not mentioned in the documents. The documents are there to inform you on their thought process and on how they'd respond to other questions.

Now, answer the following question:

{query}
"""

class ProfileRag:
    def __init__(self):
        self.retriever = None
        self.index = None
        self.embedding_model = None

        self.llm = ChatAnthropic(model=MODEL_NAME)
        self.chain = None

        self.prompt_template = PromptTemplate(input_variables=["documents", "query"],
                                              template=PROMPT_TEMPLATE)

    def set_pc_index(self, index):
        self.index = index

        return self
    
    def set_embedding_model(self, model):
        self.embedding_model = model
        
        return self

    def set_profile_name(self, name):
        vector_store = PineconeVectorStore(index = self.index,
                                           embedding=self.embedding_model,
                                           namespace=name)
        
        self.retriever = vector_store.as_retriever()
        self.chain = RetrievalQA.from_chain_type(llm = self.llm,
                                                 chain_type="stuff",
                                                 retriever=self.retriever)
        
        return self
    
    def query(self, query):
        relevant_docs = self.retriever.get_relevant_documents(query)
        
        docs_as_str = "\n".join([doc.page_content for doc in relevant_docs])

        prompt = self.prompt_template.format(documents=docs_as_str,
                                             query=query)

        response = self.llm(prompt)

        return response.content