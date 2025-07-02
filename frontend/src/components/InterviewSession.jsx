import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import './InterviewSession.css';
import ReactMarkdown from 'react-markdown';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// New component for structured feedback display
const FeedbackDisplay = ({ feedback, userAnswer }) => {
  if (!feedback) return null;

  const { 
    correctness, 
    depth, 
    relevance, 
    score, 
    detailed_feedback, 
    suggestions_for_improvement 
  } = feedback;

  // Helper function to format suggestions as bullet points
  const formatSuggestions = (suggestions) => {
    if (!suggestions) return null;

    let items = [];
    if (Array.isArray(suggestions)) {
      items = suggestions.map(item => String(item).trim()).filter(item => item.length > 0);
    } else if (typeof suggestions === 'string') {
      items = suggestions
        .split(/\n\s*[-*•]\s*|\n\s*\d+\.\s*|\n\s*[-*•]\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else {
      items = [String(suggestions)];
    }

    if (items.length === 0) {
      return <div className="suggestions">{String(suggestions)}</div>;
    }

    return (
      <div className="suggestions">
        <ul className="suggestions-list">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Helper function to get score color
  const getScoreColor = (score) => {
    const numScore = parseInt(score);
    if (numScore >= 8) return '#22c55e'; // Green for high scores
    if (numScore >= 6) return '#f59e0b'; // Orange for medium scores
    return '#ef4444'; // Red for low scores
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h3>
          <span className="feedback-icon">📊</span>
          Answer Evaluation
        </h3>
        <div className="feedback-score" style={{ background: `linear-gradient(135deg, ${getScoreColor(score)} 0%, ${getScoreColor(score)}dd 100%)` }}>
          <span className="score-label">Score:</span>
          <span className="score-value">{score}/10</span>
        </div>
      </div>

      <div className="feedback-sections">
        {/* User's Answer Section */}
        <div className="feedback-section">
          <h4 className="section-title">
            <span className="section-icon">💬</span>
            Your Answer
          </h4>
          <div className="user-answer">
            {userAnswer}
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="feedback-section">
          <h4 className="section-title">
            <span className="section-icon">📈</span>
            Evaluation
          </h4>
          <div className="evaluation-metrics">
            <div className="metric">
              <span className="metric-label">Correctness:</span>
              <span className="metric-value">{correctness}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Depth:</span>
              <span className="metric-value">{depth}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Relevance:</span>
              <span className="metric-value">{relevance}</span>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        {detailed_feedback && (
          <div className="feedback-section">
            <h4 className="section-title">
              <span className="section-icon">🔍</span>
              Detailed Analysis
            </h4>
            <div className="detailed-feedback">
              {detailed_feedback}
            </div>
          </div>
        )}

        {/* Suggestions for Improvement */}
        {suggestions_for_improvement && (
          <div className="feedback-section">
            <h4 className="section-title">
              <span className="section-icon">💡</span>
              Suggestions for Improvement
            </h4>
            {formatSuggestions(suggestions_for_improvement)}
          </div>
        )}
      </div>
    </div>
  );
};

// New component for interview summary
const InterviewSummary = ({ finalScore, overallFeedback, role, numQuestions, onBackToDashboard }) => {
  const getScoreInfo = (score) => {
    const numScore = parseInt(score);
    if (numScore >= 8) return { color: '#22c55e', message: 'Excellent!', emoji: '🎉' };
    if (numScore >= 6) return { color: '#f59e0b', message: 'Good Job!', emoji: '👍' };
    return { color: '#ef4444', message: 'Keep Practicing!', emoji: '💪' };
  };
  const scoreInfo = getScoreInfo(finalScore);
  return (
    <div className="interview-summary-container">
      <div className="summary-header">
        <h1 className="summary-title">
          <span className="summary-icon">🏆</span>
          Interview Complete!
        </h1>
        <p className="summary-subtitle">{role} Interview Results</p>
      </div>
      <div className="summary-content">
        <div className="summary-card score-card">
          <div className="score-display" style={{ background: `linear-gradient(135deg, ${scoreInfo.color} 0%, ${scoreInfo.color}dd 100%)` }}>
            <div className="score-circle">
              <span className="score-number">{finalScore !== null ? `${finalScore}/10` : '--'}</span>
              <span className="score-label">Final Score</span>
              <span className="score-percentage">{finalScore !== null ? `${finalScore * 10}%` : ''}</span>
            </div>
            <div className="score-message">
              <span className="message-emoji">{scoreInfo.emoji}</span>
              <span className="message-text">{scoreInfo.message}</span>
            </div>
          </div>
        </div>
        <div className="summary-card metrics-card">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            Performance Overview
          </h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-icon">❓</div>
              <div className="metric-content">
                <span className="metric-value">{numQuestions}</span>
                <span className="metric-label">Questions Answered</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <span className="metric-value">~{Math.round(numQuestions * 2)}min</span>
                <span className="metric-label">Estimated Duration</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <span className="metric-value">{finalScore !== null ? `${(finalScore / numQuestions).toFixed(1)}` : '--'}</span>
                <span className="metric-label">Average Per Question</span>
              </div>
            </div>
          </div>
        </div>
        {/* Render overallFeedback as markdown for a rich summary */}
        {overallFeedback && (
          <div className="summary-card markdown-summary-card">
            <ReactMarkdown>{typeof overallFeedback === 'string' ? overallFeedback : JSON.stringify(overallFeedback)}</ReactMarkdown>
          </div>
        )}
        <div className="summary-actions">
          <button className="primary-action-btn" onClick={onBackToDashboard}>
            <span className="btn-icon">🏠</span>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const InterviewSession = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const role = query.get('role') || '';
  const experience = query.get('experience') || '';
  // Remove numQuestions from here, will fetch from backend
  // const numQuestions = parseInt(query.get('numQuestions'), 10) || 5;

  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [structuredFeedback, setStructuredFeedback] = useState(null);
  const [lastUserAnswer, setLastUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [overallFeedback, setOverallFeedback] = useState(null);
  const [error, setError] = useState('');
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5); // Default, will update after fetch
  const [interviewComplete, setInterviewComplete] = useState(false); // NEW: track completion
  const [pendingNext, setPendingNext] = useState(false); // NEW: track if waiting for next question

  // Fetch interview document by ID
  const fetchInterviewDetails = async (id) => {
    try {
      const response = await api.get(`/user/interview/${id}`);
      if (response.data && response.data.num_questions) {
        setNumQuestions(response.data.num_questions);
      }
    } catch (err) {
      // fallback: keep default
    }
  };

  // Start interview on mount
  useEffect(() => {
    const startInterview = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.post('/interview/start', {
          role,
          experience,
          num_questions: parseInt(query.get('numQuestions'), 10) || 5,
        });
        setInterviewId(response.data.interview_id);
        setCurrentQuestion(response.data.first_question);
        setQuestionIndex(1);
        setUserAnswer('');
        setFeedback('');
        setStructuredFeedback(null);
        setLastUserAnswer('');
        setShowFeedback(false);
        // Fetch interview details for num_questions
        await fetchInterviewDetails(response.data.interview_id);
      } catch (err) {
        if (err.response?.status === 429 || err.response?.data?.detail?.includes('quota')) {
          setApiQuotaExceeded(true);
          setError('API quota exceeded. Using fallback questions for this session.');
        } else {
          setError('Failed to start interview.');
        }
      } finally {
        setLoading(false);
      }
    };
    startInterview();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || interviewComplete) return; // Prevent submit if complete
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/interview/answer', {
        interview_id: interviewId,
        question_text: currentQuestion,
        answer_text: userAnswer,
      });
      setFeedback(response.data.display_feedback || '');
      setStructuredFeedback(response.data.evaluation_feedback || null);
      setLastUserAnswer(userAnswer);
      setShowFeedback(true);
      setPendingNext(true); // NEW: show feedback, wait for Next
      // If interview is completed (next_question is null), set completion state
      if (response.data.next_question === null || response.data.message === "Interview completed.") {
        setQuestionIndex(numQuestions);
        setInterviewComplete(true);
      } else {
        // Store the next question for later
        setCurrentQuestion(response.data.next_question);
      }
    } catch (err) {
      if (err.response?.status === 429 || err.response?.data?.detail?.includes('quota')) {
        setApiQuotaExceeded(true);
        setError('API quota exceeded. Using fallback evaluation for this answer.');
      } else {
        setError('Failed to submit answer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW: Next button handler to show next question and answer box
  const handleNext = () => {
    setShowFeedback(false);
    setStructuredFeedback(null);
    setLastUserAnswer('');
    setUserAnswer('');
    setPendingNext(false);
    setQuestionIndex((idx) => idx + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/interview/overall-feedback', {
        interview_id: interviewId,
      });
      setFinalScore(response.data.final_score);
      setOverallFeedback(response.data.overall_feedback);
      setFinished(true);
    } catch (err) {
      if (err.response?.status === 429 || err.response?.data?.detail?.includes('quota')) {
        setApiQuotaExceeded(true);
        setError('API quota exceeded. Using fallback feedback for this interview.');
      } else {
        setError('Failed to fetch final feedback.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="interview-session-loading">Loading...</div>;
  if (error) return <div className="interview-session-error">{error}</div>;

  if (finished) {
    return (
      <InterviewSummary 
        finalScore={finalScore}
        overallFeedback={overallFeedback}
        role={role}
        numQuestions={numQuestions}
        onBackToDashboard={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="interview-session-container">
      {apiQuotaExceeded && (
        <div className="api-quota-notice">
          <div className="notice-icon">⚠️</div>
          <div className="notice-content">
            <strong>API Quota Exceeded</strong>
            <p>You've reached the daily limit for AI-generated questions. This session will use pre-written questions and evaluations.</p>
          </div>
        </div>
      )}
      <div className="interview-question-card">
        <div className="interview-header">
          <div className="interview-role">{role} Interview</div>
          <div className="interview-progress">Question {questionIndex} of {numQuestions}</div>
        </div>
        {/* Only show question and answer box if not showing feedback */}
        {!pendingNext && !interviewComplete && (
          <>
            <div className="interview-question">{currentQuestion}</div>
            <textarea
              className="interview-answer-input"
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              rows={6}
            />
          </>
        )}
        {/* Show feedback after submit, with Next button */}
        {showFeedback && (
          <>
            <FeedbackDisplay 
              feedback={structuredFeedback} 
              userAnswer={lastUserAnswer}
            />
            <div className="interview-actions">
              {pendingNext && !interviewComplete && (
                <button className="next-btn" onClick={handleNext}>Next</button>
              )}
              {interviewComplete && !finished && (
                <button className="finish-btn" onClick={handleFinish}>Finish Interview</button>
              )}
            </div>
          </>
        )}
        {/* Only show submit if not showing feedback or interview complete */}
        <div className="interview-actions">
          {!showFeedback && !interviewComplete && (
            <button className="submit-btn" onClick={handleSubmit} disabled={!userAnswer.trim()}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession; 