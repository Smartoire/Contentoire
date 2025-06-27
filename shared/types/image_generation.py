from dataclasses import dataclass
from typing import Optional

@dataclass
class ImageGenerationRequest:
    prompt: str
    width: int = 512
    height: int = 512
    style: Optional[str] = None

@dataclass
class ImageGenerationResponse:
    image_data: str  # Base64 encoded image
    width: int
    height: int
    prompt: str
