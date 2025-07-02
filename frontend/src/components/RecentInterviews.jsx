import React, { useState } from 'react';
import RecentInterviewCard from './RecentInterviewCard';
import InterviewDetailsModal from './InterviewDetailsModal';
import api from '../api';
import './RecentInterviews.css';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString || dateString === "Unknown") return "Unknown";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "Unknown";
  }
};

function RecentInterviews({ interviews, onViewAll }) {
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [allInterviews, setAllInterviews] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const handleViewDetails = async (interview) => {
    setLoadingDetails(true);
    try {
      // interview may have an id or you may need to pass it from parent
      const id = interview.id || interview.interview_id || interview._id;
      const response = await api.get(`/recent-interviews/${id}`);
      setSelectedInterview(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      alert('Failed to fetch interview details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewAll = async () => {
    setLoadingAll(true);
    try {
      // Get uid from localStorage (or pass as prop if preferred)
      const uid = localStorage.getItem('uid');
      if (!uid) {
        alert('User ID not found. Please log in again.');
        setLoadingAll(false);
        return;
      }
      const response = await api.get(`/user/all-interviews/${uid}`);
      setAllInterviews(response.data.all_interviews);
      setShowAllModal(true);
    } catch (err) {
      alert('Failed to fetch all interviews.');
    } finally {
      setLoadingAll(false);
    }
  };

  // Handle empty state
  if (!interviews || interviews.length === 0) {
    return (
      <div className="recent-interviews-section">
        <div className="recent-interviews-header">
          <div>
            <div className="recent-interviews-title">Recent Interviews</div>
            <div className="recent-interviews-subtitle">Your latest practice sessions and results</div>
          </div>
        </div>
        <div className="recent-interviews-empty">
          <div className="empty-icon">📝</div>
          <div className="empty-text">No interviews completed yet</div>
          <div className="empty-subtext">Start your first interview to see your results here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-interviews-section">
      <div className="recent-interviews-header">
        <div>
          <div className="recent-interviews-title">Recent Interviews</div>
          <div className="recent-interviews-subtitle">Your latest practice sessions and results</div>
        </div>
        <button className="recent-interviews-viewall" onClick={handleViewAll}>View All</button>
      </div>
      <div className="recent-interviews-list">
        {interviews.map((interview, idx) => {
          const answered = interview.answers ? interview.answers.length : 0;
          const total = interview.num_questions || (interview.questions && interview.questions.length) || 10;
          const progress = `${answered}/${total} questions completed`;
          return (
            <RecentInterviewCard
              key={interview.id || idx}
              title={interview.title}
              date={formatDate(interview.date)}
              progress={progress}
              score={interview.score}
              answered={answered}
              total={total}
              onViewDetails={() => handleViewDetails(interview)}
            />
          );
        })}
      </div>
      <InterviewDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        interview={selectedInterview}
      />
      {loadingDetails && <div className="recent-interviews-loading">Loading details...</div>}
      {showAllModal && (
        <div className="details-modal-bg">
          <div className="details-modal" style={{ maxWidth: 800, width: '98vw', maxHeight: '92vh', overflowY: 'auto' }}>
            <button className="close-btn" onClick={() => setShowAllModal(false)}>&times;</button>
            <h2 style={{marginBottom: 12}}>All Interview History</h2>
            {loadingAll ? (
              <div>Loading...</div>
            ) : allInterviews.length === 0 ? (
              <div>No interviews found.</div>
            ) : (
              allInterviews.map((interview, idx) => {
                const answered = interview.answers ? interview.answers.length : 0;
                const total = interview.num_questions || (interview.questions && interview.questions.length) || 10;
                const progress = `${answered}/${total} questions completed`;
                return (
                  <RecentInterviewCard
                    key={interview.id || idx}
                    title={interview.title}
                    date={formatDate(interview.date)}
                    progress={progress}
                    score={interview.score}
                    answered={answered}
                    total={total}
                    onViewDetails={() => handleViewDetails(interview)}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentInterviews; 