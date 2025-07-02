
from typing import Optional

from pydantic import BaseModel


class JobResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[str]