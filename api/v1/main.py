from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from job import jobs
from media import social_medias
from provider.auth import auth_providers
from provider.content import content_providers
from provider.news import news_providers
from user import auth, users

app = FastAPI(
    title="Contentoire API",
    openapi_url="/contentoire/api/v1/openapi.json",
    docs_url="/contentoire/api/v1/docs",
    redoc_url="/contentoire/api/v1/redoc"
)

# Register routers
app.include_router(auth.router, prefix="/contentoire/api/v1")
app.include_router(news_providers.router, prefix="/contentoire/api/v1")
app.include_router(content_providers.router, prefix="/contentoire/api/v1")
app.include_router(auth_providers.router, prefix="/contentoire/api/v1")
app.include_router(users.router, prefix="/contentoire/api/v1")
app.include_router(social_medias.router, prefix="/contentoire/api/v1")
app.include_router(jobs.router, prefix="/contentoire/api/v1")

# --- Authentication Models & Endpoints ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
