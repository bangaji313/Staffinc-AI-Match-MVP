import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import initialize_rag, find_best_match

class MatchRequest(BaseModel):
    client_requirement: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Staffinc AI Match MVP Backend is running"}

@app.post("/api/init-db")
async def init_db():
    with open("data/candidates.json", "r") as f:
        data_list = json.load(f)
    initialize_rag(data_list)
    return {"message": "Database initialized successfully"}

@app.post("/api/match")
async def match_candidates(request: MatchRequest):
    response = find_best_match(request.client_requirement)
    return {"match_result": response}
