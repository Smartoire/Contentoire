
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
