from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from temporalio.client import Client
from temporalio.worker import Worker
from temporalio.workflow import workflow_method, Workflow
from temporalio.activity import activity_method, Activity
import spacy
from transformers import pipeline
from PIL import Image
import io
import base64

app = FastAPI()

class JobRequest(BaseModel):
    text: str
    type: str  # 'summarize', 'ner', or 'image'

class JobResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[str]

# Temporal Client
async def init_temporal_client():
    return await Client.connect("localhost:7233")

# ML Models
nlp = spacy.load("en_core_web_sm")
summarizer = pipeline("summarization")

# Activities
@activity_method()
class MLActivities:
    async def summarize_text(self, text: str) -> str:
        summary = summarizer(text, max_length=130, min_length=30, do_sample=False)
        return summary[0]['summary_text']

    async def extract_entities(self, text: str) -> List[dict]:
        doc = nlp(text)
        return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]

    async def generate_image(self, prompt: str) -> str:
        # TODO: Implement image generation
        return ""  # Return base64 encoded image

# Workflow
@workflow_method()
class MLWorkflow:
    async def process_job(self, request: JobRequest):
        activities = self.new_activity_handle(MLActivities)
        
        if request.type == "summarize":
            return await activities.summarize_text(request.text)
        elif request.type == "ner":
            return await activities.extract_entities(request.text)
        elif request.type == "image":
            return await activities.generate_image(request.text)
        else:
            raise ValueError(f"Unknown job type: {request.type}")

@app.post("/api/jobs", response_model=JobResponse)
async def create_job(request: JobRequest):
    client = await init_temporal_client()
    workflow = client.new_workflow_handle(MLWorkflow)
    
    try:
        result = await workflow.execute(request)
        return JobResponse(job_id="123", status="completed", result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
