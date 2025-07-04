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
        <div className="details-modal-header">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <h2>{interview.role} Interview</h2>
        </div>
        <div className="details-modal-content">
          <div className="details-meta">
            <span>Date: {interview.date ? new Date(interview.date.seconds ? interview.date.seconds * 1000 : interview.date).toLocaleString() : 'N/A'}</span>
          </div>
          <h3>Questions & Answers</h3>
          <div className="details-qa-list">
            {interview.questions.map((q, idx) => (
              <div className="details-qa-item" key={idx}>
                <div className="details-q"><strong>Q{idx + 1}:</strong> {q.text}</div>
                <div className="details-a"><strong>Your Answer:</strong> {interview.answers[idx]?.text || <em>No answer</em>}</div>
              </div>
            ))}
          </div>
          
          {interview.overall_feedback && (
            <div className="details-overall-feedback">
              <h3>Overall Feedback</h3>
              <div className="details-feedback-content">
                {interview.overall_feedback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewDetailsModal; 