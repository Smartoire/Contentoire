from pydantic import BaseModel


class NewsProviderBase(BaseModel):
    code: str
    title: str
    logo: str
    enabled: bool = True

class NewsProviderCreate(NewsProviderBase):
    pass

class NewsProviderOut(NewsProviderBase):
    id: int

    class Config:
        orm_mode = True