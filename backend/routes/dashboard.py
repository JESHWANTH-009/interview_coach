from fastapi import APIRouter, HTTPException
from firebase_admin import firestore  # Using firebase_admin since your code uses it

router = APIRouter()
db = firestore.client()

@router.get("/dashboard/{uid}")
async def get_dashboard_data(uid: str):
    try:
        # Fetch user document
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()
        name = user_data.get("display_name", "User")

        # Fetch completed interview documents for this user
        # First get all interviews for the user, then filter and sort in Python to avoid index requirements
        interviews_query = db.collection("interviews").where("user_uid", "==", uid)
        interviews = interviews_query.stream()

        interview_list = []
        total_score = 0
        count = 0

        for interview in interviews:
            i = interview.to_dict()
            
            # Only process completed interviews (is_active == False)
            if i.get("is_active", True):
                continue
            
            # Calculate score from evaluation data
            evaluations = i.get("evaluation", [])
            if evaluations:
                # Calculate average score from all evaluations
                scores = []
                for eval_item in evaluations:
                    feedback = eval_item.get("feedback", {})
                    if isinstance(feedback, dict) and "score" in feedback:
                        try:
                            score_val = int(feedback["score"])
                            scores.append(score_val)
                        except (ValueError, TypeError):
                            continue
                
                if scores:
                    score = int(sum(scores) / len(scores))
                else:
                    score = 0
            else:
                score = 0
            
            # Get interview details
            num_questions = len(i.get("questions", []))
            num_answers = len(i.get("answers", []))
            
            # Format date properly
            created_at = i.get("created_at")
            if created_at:
                if hasattr(created_at, 'isoformat'):
                    # Firestore timestamp
                    date_str = created_at.isoformat()
                elif isinstance(created_at, str):
                    # Already a string
                    date_str = created_at
                else:
                    date_str = str(created_at)
            else:
                date_str = "Unknown"
            
            interview_data = {
                "id": interview.id,
                "title": i.get("role", "Developer"),
                "date": date_str,
                "progress": f"{score}/10",
                "score": score,
                "role": i.get("role", "Developer"),
                "experience": i.get("experience", ""),
                "ended_at": i.get("ended_at", ""),
                "created_at": created_at  # Keep for sorting
            }
            
            interview_list.append(interview_data)
            total_score += score
            count += 1
            print(f"total_interviews: {count}")

        # Sort by creation date (newest first) and get only the latest 3 interviews
        interview_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        recent_interviews = interview_list[:3]

        average_score = total_score // count if count > 0 else 0
        best_score = max([i["score"] for i in interview_list], default=0)

        return {
            "name": name,
            "total_interviews": count,
            "average_score": average_score,
            "best_score": best_score,
            "recent_interviews": recent_interviews
        }

    except Exception as e:
        print(f"Error in dashboard endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-interviews/{uid}")
async def get_all_interviews(uid: str):
    try:
        # Fetch all interviews for the user, then filter and sort in Python
        interviews_query = db.collection("interviews").where("user_uid", "==", uid)
        interviews = interviews_query.stream()
        
        interview_list = []
        for interview in interviews:
            i = interview.to_dict()
            
            # Only process completed interviews (is_active == False)
            if i.get("is_active", True):
                continue
            
            # Calculate score from evaluation data
            evaluations = i.get("evaluation", [])
            if evaluations:
                scores = []
                for eval_item in evaluations:
                    feedback = eval_item.get("feedback", {})
                    if isinstance(feedback, dict) and "score" in feedback:
                        try:
                            score_val = int(feedback["score"])
                            scores.append(score_val)
                        except (ValueError, TypeError):
                            continue
                
                if scores:
                    score = int(sum(scores) / len(scores))
                else:
                    score = 0
            else:
                score = 0
            
            num_questions = len(i.get("questions", []))
            num_answers = len(i.get("answers", []))
            
            # Format date properly
            created_at = i.get("created_at")
            if created_at:
                if hasattr(created_at, 'isoformat'):
                    date_str = created_at.isoformat()
                elif isinstance(created_at, str):
                    date_str = created_at
                else:
                    date_str = str(created_at)
            else:
                date_str = "Unknown"
            
            interview_list.append({
                "id": interview.id,
                "title": i.get("role", "Developer"),
                "date": date_str,
                "progress": f"{num_answers}/{num_questions} questions completed",
                "score": score,
                "role": i.get("role", "Developer"),
                "experience": i.get("experience", ""),
                "ended_at": i.get("ended_at", ""),
                "created_at": created_at  # Keep for sorting
            })
        
        # Sort by creation date (newest first)
        interview_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"all_interviews": interview_list}
    except Exception as e:
        print(f"Error in all-interviews endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
