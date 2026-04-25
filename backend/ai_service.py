import json
import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate

# Load environment variables
load_dotenv()

def initialize_rag(data_list):
    """
    Takes a list of dictionaries, converts them into LangChain Document objects,
    generates embeddings using MistralAIEmbeddings, and saves them locally using Chroma.
    """
    documents = []
    for item in data_list:
        # Convert dictionary to JSON string to use as document content
        page_content = json.dumps(item)
        doc = Document(page_content=page_content)
        documents.append(doc)
    
    embeddings = MistralAIEmbeddings()
    
    # Generate embeddings and persist locally
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    return vectorstore

def find_best_match(client_requirement: str) -> str:
    """
    Initializes ChatMistralAI, retrieves the top 3 matching candidates from ChromaDB
    based on the client requirement, and asks the LLM to explain why they are a good fit.
    """
    llm = ChatMistralAI()
    embeddings = MistralAIEmbeddings()
    
    # Load the persisted ChromaDB
    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )
    
    # Retrieve top 3 candidates that match the client requirement
    retrieved_docs = vectorstore.similarity_search(query=client_requirement, k=3)
    
    # Format the retrieved documents to provide context to the LLM
    candidates_context = "\n\n".join([f"Candidate {i+1}:\n{doc.page_content}" for i, doc in enumerate(retrieved_docs)])
    
    template = """You are an expert HR Matchmaker.
    
The client has the following requirement:
{client_requirement}

Here are the top 3 matching candidate profiles from our database:
{candidates_context}

Based on these profiles, please explain why these candidates are a good fit for the requirement.
"""
    
    prompt = PromptTemplate(
        template=template,
        input_variables=["client_requirement", "candidates_context"]
    )
    
    chain = prompt | llm
    
    response = chain.invoke({
        "client_requirement": client_requirement,
        "candidates_context": candidates_context
    })
    
    return response.content
