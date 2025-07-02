import React, { useRef, useEffect } from 'react';
import './InterviewDetailsModal.css';

function InterviewDetailsModal({ open, onClose, interview }) {
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open || !interview) return null;

  return (
    <div className="details-modal-bg">
      <div className="details-modal" ref={modalRef}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{interview.role} Interview</h2>
        <div className="details-meta">
          <span>Date: {interview.date ? new Date(interview.date.seconds ? interview.date.seconds * 1000 : interview.date).toLocaleString() : 'N/A'}</span>
          {interview.score !== undefined && <span>Score: {interview.score}%</span>}
        </div>
        <h3>Questions & Answers</h3>
        <div className="details-qa-list">
          {interview.questions.map((q, idx) => (
            <div className="details-qa-item" key={idx}>
              <div className="details-q"><strong>Q{idx + 1}:</strong> {q.text}</div>
              <div className="details-a"><strong>A:</strong> {interview.answers[idx]?.text || <em>No answer</em>}</div>
            </div>
          ))}
        </div>
        {interview.overall_feedback && (
          <div className="details-feedback">
            <h3>Overall Feedback</h3>
            {interview.overall_feedback.overall_assessment && <p><strong>Assessment:</strong> {interview.overall_feedback.overall_assessment}</p>}
            {interview.overall_feedback.strengths && interview.overall_feedback.strengths.length > 0 && (
              <div><strong>Strengths:</strong><ul>{interview.overall_feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            )}
            {interview.overall_feedback.weaknesses && interview.overall_feedback.weaknesses.length > 0 && (
              <div><strong>Weaknesses:</strong><ul>{interview.overall_feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
            )}
            {interview.overall_feedback.areas_for_improvement && interview.overall_feedback.areas_for_improvement.length > 0 && (
              <div><strong>Areas for Improvement:</strong><ul>{interview.overall_feedback.areas_for_improvement.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
            )}
            {interview.overall_feedback.general_recommendation && <p><strong>Recommendation:</strong> {interview.overall_feedback.general_recommendation}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewDetailsModal; 