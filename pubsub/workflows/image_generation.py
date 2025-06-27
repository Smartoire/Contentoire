from temporalio import workflow, activity
from dataclasses import dataclass
from typing import Optional

@dataclass
class ImageGenerationInput:
    prompt: str
    width: int = 512
    height: int = 512
    style: Optional[str] = None

@workflow.defn
class ImageGenerationWorkflow:
    @workflow.run
    async def run(self, input: ImageGenerationInput) -> str:
        """
        Main workflow to generate an image
        
        Args:
            input: ImageGenerationInput containing prompt and optional parameters
            
        Returns:
            str: Base64 encoded image data
        """
        # Execute the image generation activity
        return await workflow.execute_activity(
            "generate_image",
            args=[input.prompt, input.width, input.height],
            start_to_close_timeout=180
        )
