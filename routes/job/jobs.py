from fastapi import APIRouter
from models.job_request import JobRequest
from models.job_response import JobResponse
from temporalio.client import Client

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"],
    responses={404: {"description": "Not found"}}
)


# Temporal Client
async def init_temporal_client():
    return await Client.connect("localhost:7233")

# # ML Models
# nlp = spacy.load("en_core_web_sm")
# summarizer = pipeline("summarization")



@router.post("/", response_model=JobResponse)
async def create_job(request: JobRequest):
    # Dummy implementation for now
    return JobResponse(job_id="123", status="completed", result="result")
