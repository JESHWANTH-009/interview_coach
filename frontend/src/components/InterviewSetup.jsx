import React, { useState } from 'react';
import './InterviewSetup.css';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
];
const EXPERIENCES = ['Intern', 'Junior', 'Mid', 'Senior', 'Lead'];
const QUESTION_COUNTS = [5, 10, 15, 20];


function InterviewSetup({ open, onClose }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [numQuestions, setNumQuestions] = useState('');

  if (!open) return null;



  const handleStart = () => {
    if (!role || !experience || !numQuestions) return;
    navigate(`/interview-session?role=${encodeURIComponent(role)}&experience=${encodeURIComponent(experience)}&numQuestions=${numQuestions}`);
  };

  return (
    <div className="interview-setup-modal-bg">
      <div className="interview-setup-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Set Up Your Interview</h2>
        <div className="modal-section">
          <label>What role are you interviewing for?</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Select a role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="modal-section">
          <label>What's your experience level?</label>
          <select value={experience} onChange={e => setExperience(e.target.value)}>
            <option value="">Select experience level</option>
            {EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="modal-section">
          <label>Number of Questions</label>
          <select value={numQuestions} onChange={e => setNumQuestions(e.target.value)}>
            <option value="">Select number</option>
            {QUESTION_COUNTS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="start-btn" onClick={handleStart} disabled={!role || !experience || !numQuestions}>
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup; 