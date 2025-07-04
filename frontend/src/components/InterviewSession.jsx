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
const InterviewSummary = ({ finalScore, perQuestionScores, overallFeedback, role, numQuestions, onBackToDashboard, questionAnswerBreakdown }) => {
  // Calculate total score and percentage
  const totalScore = Array.isArray(perQuestionScores) ? perQuestionScores.reduce((sum, s) => sum + (parseInt(s) || 0), 0) : 0;
  const totalPossible = (Array.isArray(perQuestionScores) ? perQuestionScores.length : numQuestions) * 10;
  const percent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  return (
    <div className="final-summary-page">
      <div className="final-summary-container">
        <div className="final-summary-header">
          <h1 className="final-summary-title">Interview Complete!</h1>
          <p className="final-summary-subtitle">{role} Interview Results</p>
        </div>
        
        <div className="final-summary-content">
          {/* Final Score Section */}
          <section className="summary-section">
            <h2 className="section-heading">Final Score</h2>
            <div className="final-score-display">
              <div className="score-number">{totalScore}/{totalPossible}</div>
              <div className="score-percentage">({percent}%)</div>
            </div>
          </section>

          {/* Summary of Performance */}
          <section className="summary-section">
            <h2 className="section-heading">Summary of Your Interview Performance</h2>
            <div className="performance-summary">
              <p>You completed {Array.isArray(perQuestionScores) ? perQuestionScores.length : numQuestions} questions in this {role} interview. 
              Your overall performance shows {percent >= 70 ? 'strong' : percent >= 50 ? 'moderate' : 'room for improvement'} understanding of the key concepts.</p>
            </div>
          </section>

          {/* Your Strengths */}
          <section className="summary-section">
            <h2 className="section-heading">Your Strengths</h2>
            <div className="strengths-content">
              <p>Based on your responses, you demonstrated solid knowledge in several areas. 
              Your ability to articulate technical concepts and provide structured answers shows good communication skills.</p>
            </div>
          </section>

          {/* Areas for Improvement */}
          <section className="summary-section">
            <h2 className="section-heading">Areas You Can Improve</h2>
            <div className="improvement-content">
              <p>Focus on deepening your understanding of specific technical concepts and practice providing more detailed explanations 
              with concrete examples to strengthen your responses.</p>
            </div>
          </section>

          {/* What to Study Next */}
          <section className="summary-section">
            <h2 className="section-heading">What to Study Next</h2>
            <div className="study-content">
              <p>Consider reviewing the core concepts related to {role} development, 
              practice coding problems, and work on improving your problem-solving approach.</p>
            </div>
          </section>

          {/* Confidence in Feedback */}
          <section className="summary-section">
            <h2 className="section-heading">Confidence in Feedback</h2>
            <div className="confidence-content">
              <p>This evaluation is based on your responses to interview questions and provides a reliable assessment 
              of your current knowledge level in this domain.</p>
            </div>
          </section>

          {/* Recommended Next Steps */}
          <section className="summary-section">
            <h2 className="section-heading">Recommended Next Steps</h2>
            <div className="next-steps-content">
              <ul className="next-steps-list">
                <li>Review the questions you found challenging</li>
                <li>Practice similar problems to build confidence</li>
                <li>Consider taking another interview to track your progress</li>
                <li>Focus on areas where you scored lower</li>
              </ul>
            </div>
          </section>

          {/* Per-Question Scores (Optional) */}
          {questionAnswerBreakdown && questionAnswerBreakdown.length > 0 && (
            <section className="summary-section">
              <h2 className="section-heading">Per-Question Scores</h2>
              <div className="question-scores">
                {questionAnswerBreakdown.map((item, idx) => (
                  <div className="question-score-item" key={idx}>
                    <div className="question-text">
                      <strong>Q{idx + 1}:</strong> {item.question}
                    </div>
                    <div className="answer-text">
                      <strong>Your Answer:</strong> {item.answer}
                    </div>
                    <div className="score-display">
                      <span className="score-badge">Score: {item.score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Return to Dashboard Button */}
          <div className="summary-actions">
            <button className="return-dashboard-btn" onClick={onBackToDashboard}>
              Return to Dashboard
            </button>
          </div>
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
  const [perQuestionScores, setPerQuestionScores] = useState([]);
  const [questionAnswerBreakdown, setQuestionAnswerBreakdown] = useState([]);

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
      if (response.data.next_question === null || response.data.message === "Interview completed.") {
        setQuestionIndex(numQuestions);
        setInterviewComplete(true);
        // Automatically fetch overall feedback after last answer
        setLoading(true);
        try {
          const feedbackResponse = await api.post('/interview/overall-feedback', {
            interview_id: interviewId,
          });
          setFinalScore(feedbackResponse.data.final_score);
          setOverallFeedback(feedbackResponse.data.overall_feedback);
          setPerQuestionScores(feedbackResponse.data.per_question_scores || []);
          // Build question+answer+score breakdown for UI
          if (feedbackResponse.data.questions) {
            setQuestionAnswerBreakdown(feedbackResponse.data.questions.map((q, idx) => ({
              question: q.question,
              answer: q.user_answer,
              score: q.score,
            })));
          } else {
            setQuestionAnswerBreakdown([]);
          }
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
      } else {
        // Immediately show next question and clear answer
        setCurrentQuestion(response.data.next_question);
        setUserAnswer('');
        setShowFeedback(false);
        setStructuredFeedback(null);
        setLastUserAnswer('');
        setQuestionIndex((idx) => idx + 1);
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

  if (loading) return <div className="interview-session-loading">Loading...</div>;
  if (error) return <div className="interview-session-error">{error}</div>;

  if (finished) {
    return (
      <InterviewSummary 
        finalScore={finalScore}
        perQuestionScores={perQuestionScores}
        overallFeedback={overallFeedback}
        role={role}
        numQuestions={numQuestions}
        onBackToDashboard={() => navigate('/dashboard')}
        questionAnswerBreakdown={questionAnswerBreakdown}
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
        {/* Only show question and answer box if not interviewComplete */}
        {!interviewComplete && (
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
        {/* Show feedback if showFeedback is true and interviewComplete */}
        {showFeedback && interviewComplete && (
          <FeedbackDisplay 
            feedback={structuredFeedback} 
            userAnswer={lastUserAnswer}
          />
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