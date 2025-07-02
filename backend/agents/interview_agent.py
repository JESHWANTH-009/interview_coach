import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import re

load_dotenv()

# ✅ Load API key properly
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ✅ Instantiate the model correctly
model = genai.GenerativeModel("gemini-2.0-flash")

class GeminiQuotaExceededError(Exception):
    """Raised when Gemini API quota is exceeded."""
    pass


# ✅ Extract text helper
def extract_text_from_response(response) -> str:
    try:
        if hasattr(response, 'text') and response.text:
            return response.text.strip()
        elif hasattr(response, 'parts') and response.parts:
            return response.parts[0].text.strip()
    except Exception as e:
        print(f"[ERROR] extract_text_from_response failed: {e}")
    return "Failed to extract valid response text from Gemini."


# ✅ Generate first question
async def generate_first_question(role: str, experience: str) -> str:
    prompt = (
        f"You are an AI Interview Coach specializing in {role} roles. "
        f"The candidate has {experience} of experience. "
        "Start the interview by asking a relevant first question. "
        "Keep the question concise and professional. Do not include any greetings or conversational fillers, just the question itself. "
        "Example: Tell me about your experience with Python development. "
        f"Candidate: {role}, Experience: {experience}. "
        "First question:"
    )
    try:
        response = await model.generate_content_async(prompt)
        return extract_text_from_response(response)
    except Exception as e:
        print(f"[ERROR] generate_first_question failed: {e}")
        return "Failed to generate the first question. Please try again later."


# ✅ Generate next question
async def generate_next_question(role: str, experience: str, conversation_history: list[dict]) -> str:
    instruction = (
        f"You are an AI Interview Coach specializing in {role} roles. "
        f"The candidate has {experience} of experience. "
        "Based on the conversation so far, ask a relevant and challenging next question. "
        "Do not greet the candidate or provide any feedback on their previous answer. "
        "Just ask the next question directly. If the interview seems complete, ask a concluding question or suggest ending."
    )
    try:
        chat = model.start_chat(history=conversation_history)
        response = await chat.send_message_async(instruction + "\n\nWhat is the next question?")
        return extract_text_from_response(response)
    except Exception as e:
        print(f"[ERROR] generate_next_question failed: {e}")
        return "Failed to generate the next question. Please try again later."


# ✅ Evaluate candidate's answer
def clean_json_block(text: str) -> str:
    if text.startswith("```json") or text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text)
        text = text.replace("```", "").strip()
    return text

# ✅ Evaluate candidate's answer (with proper markdown JSON cleanup)
async def evaluate_answer(role: str, experience: str, question: str, answer: str) -> dict:
    prompt = (
        f"You are an AI Interview Coach specializing in {role} roles with {experience} of experience. "
        f"Evaluate the following answer to the question '{question}'. "
        f"Candidate's answer: '{answer}'. "
        "Provide a structured JSON output with the following fields:\n"
        "- 'correctness': A brief assessment (e.g., 'Correct', 'Partially Correct', 'Incorrect').\n"
        "- 'depth': A brief assessment of depth (e.g., 'Shallow', 'Good', 'Excellent').\n"
        "- 'relevance': A brief assessment of relevance (e.g., 'High', 'Medium', 'Low').\n"
        "- 'score': An integer score from 0 to 10.\n"
        "- 'detailed_feedback': Concise paragraphs of constructive feedback.\n"
        "- 'suggestions_for_improvement': Bullet points with improvement tips.\n\n"
        "Only return valid JSON without any extra commentary or markdown."
    )
    try:
        response = await model.generate_content_async(prompt)
        text = extract_text_from_response(response)
        cleaned_text = clean_json_block(text)  # 🔧 Remove markdown code blocks

        feedback_dict = json.loads(cleaned_text)
        feedback_dict['score'] = int(feedback_dict.get('score', 0))
        return feedback_dict

    except json.JSONDecodeError as jde:
        print(f"[ERROR] JSON parsing failed: {jde} | Response: {text}")
        return {
            "correctness": "N/A", "depth": "N/A", "relevance": "N/A", "score": 0,
            "detailed_feedback": "Invalid response format from Gemini.",
            "suggestions_for_improvement": "Please try again."
        }
    except Exception as e:
        print(f"[ERROR] evaluate_answer failed: {e}")
        return {
            "correctness": "N/A", "depth": "N/A", "relevance": "N/A", "score": 0,
            "detailed_feedback": f"Evaluation failed: {e}",
            "suggestions_for_improvement": "Internal error occurred."
        }

def generate_overall_feedback(interview_data: dict) -> str:
    if not interview_data.get("questions"):
        return "No questions were answered during this interview."

    prompt_parts = [
        f"You are an AI Interview Coach. Provide overall feedback for an interview based on role, experience, and evaluations.\n",
        f"**Role:** {interview_data.get('role', 'N/A')}\n",
        f"**Experience:** {interview_data.get('experience', 'N/A')}\n\n",
        f"**Transcript and Feedback:**\n"
    ]

    for i, qa in enumerate(interview_data.get("questions", [])):
        prompt_parts.append(f"**Q{i+1}**: {qa.get('question')}\n")
        prompt_parts.append(f"**Answer**: {qa.get('user_answer')}\n")
        prompt_parts.append(f"**Feedback**: {qa.get('evaluation_feedback')}\n\n")

    prompt_parts.append(
        "**Please summarize the candidate's strengths, weaknesses, and give a final recommendation. Use markdown and bullet points.**"
    )

    prompt = "".join(prompt_parts)

    try:
        response = model.generate_content(prompt)
        return extract_text_from_response(response)
    except Exception as e:
        print(f"[ERROR] generate_overall_feedback failed: {e}")
        return "Failed to generate overall feedback due to an internal error."
