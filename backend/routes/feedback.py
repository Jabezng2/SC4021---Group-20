from flask import Blueprint, request, jsonify
from backend.feedback_store import update_feedback, get_feedback_score

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    doc_id = data.get('doc_id')
    value = data.get('value')  # +1 for relevant, -1 for not relevant

    if not doc_id or value not in [-1, 1]:
        return jsonify({"error": "Invalid input"}), 400

    update_feedback(doc_id, value)
    updated_score = get_feedback_score(doc_id)

    return jsonify({
        "doc_id": doc_id,
        "updated_score": updated_score
    })