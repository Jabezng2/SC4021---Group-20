import os
import pickle

FEEDBACK_FILE = "feedback_scores.pkl"
feedback_scores = {}

def load_feedback_scores():
    global feedback_scores
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, "rb") as f:
            feedback_scores = pickle.load(f)
            print(f"[INFO] Loaded {len(feedback_scores)} feedback scores.")
    else:
        print("[INFO] No feedback file found. Starting fresh.")

def save_feedback_scores():
    with open(FEEDBACK_FILE, "wb") as f:
        pickle.dump(feedback_scores, f)

def update_feedback(doc_id: str, score_change: int):
    feedback_scores[doc_id] = feedback_scores.get(doc_id, 0) + score_change
    save_feedback_scores()

def get_feedback_score(doc_id: str) -> int:
    return feedback_scores.get(doc_id, 0)

def bulk_feedback_scores(doc_ids: list[str]) -> dict[str, int]:
    return {doc_id: feedback_scores.get(doc_id, 0) for doc_id in doc_ids}