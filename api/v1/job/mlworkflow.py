
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
