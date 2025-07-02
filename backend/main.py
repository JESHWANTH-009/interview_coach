from fastapi import FastAPI
from routes.user import router as user_router
from routes.interview import router as interview_router
from fastapi.middleware.cors import CORSMiddleware
# Corrected: Import 'router' as 'auth_router' from the 'auth' module
from auth import auth_router # <--- CORRECTED IMPORT
from dotenv import load_dotenv
from routes.dashboard import router as dashboard_router
from routes.recent_interviews import router as recent_interviews_router

import os

app = FastAPI()

FRONT_END_API = os.getenv("FRONT_END_API")
FRONT_END_LOCAL = os.getenv("FRONT_END_LOCAL")

origins = [
    # React app development server
    FRONT_END_API,  # For cases where browser uses localhost
    FRONT_END_LOCAL,# Add your deployed frontend URL here when you deploy, e.g., "https://your-frontend-app.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routes
# Use the aliased name 'auth_router' here
app.include_router(auth_router) # <--- CORRECTED USAGE
app.include_router(user_router,prefix="/user")
app.include_router(interview_router, tags=["Interview Flow"]) 
app.include_router(dashboard_router, prefix="/user", tags=["Dashboard"])
app.include_router(recent_interviews_router, tags=["Recent Interviews"])

@app.get("/")
async def read_root():
    """
    Root endpoint for the AI Interview Coach Backend.
    """
    return {"message": "Welcome to the AI Interview Coach Backend!"}