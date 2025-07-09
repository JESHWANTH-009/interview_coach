from fastapi import FastAPI
from routes.user import router as user_router
from routes.interview import router as interview_router
from fastapi.middleware.cors import CORSMiddleware
from auth import auth_router  # Corrected
from dotenv import load_dotenv, find_dotenv
from routes.dashboard import router as dashboard_router
from routes.recent_interviews import router as recent_interviews_router
import os

# ✅ ADDED for Swagger Customization
from fastapi.openapi.utils import get_openapi

load_dotenv(find_dotenv(".env"))

app = FastAPI()

FRONT_END_API = os.getenv("FRONT_END_API")
FRONT_END_LOCAL = os.getenv("FRONT_END_LOCAL")

origins = [
    FRONT_END_API,
    FRONT_END_LOCAL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#ADDED: Custom OpenAPI for Bearer token in Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="AI Interview Coach API",
        version="1.0.0",
        description="API with Firebase Authentication",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi  #HOOK custom Swagger
#Include routers
app.include_router(auth_router)
app.include_router(user_router, prefix="/user")
app.include_router(interview_router, tags=["Interview Flow"])
app.include_router(dashboard_router, prefix="/user", tags=["Dashboard"])
app.include_router(recent_interviews_router, tags=["Recent Interviews"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI Interview Coach Backend!"}
