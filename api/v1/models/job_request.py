from pydantic import BaseModel


class JobRequest(BaseModel):
    text: str
    type: str  # 'summarize', 'ner', or 'image'