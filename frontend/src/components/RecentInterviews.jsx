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

function RecentInterviews({ interviews }) {
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [page, setPage] = useState(1);
  const interviewsPerPage = 5;
  const totalPages = Math.ceil((interviews?.length || 0) / interviewsPerPage);

  const handleViewDetails = async (interview) => {
    setLoadingDetails(true);
    try {
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

  // Pagination logic
  const startIdx = (page - 1) * interviewsPerPage;
  const endIdx = startIdx + interviewsPerPage;
  const paginatedInterviews = interviews.slice(startIdx, endIdx);

  return (
    <div className="recent-interviews-section">
      <div className="recent-interviews-header">
        <div>
          <div className="recent-interviews-title">Recent Interviews</div>
          <div className="recent-interviews-subtitle">Your latest practice sessions and results</div>
        </div>
      </div>
      <div className="recent-interviews-list">
        {paginatedInterviews.map((interview, idx) => {
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
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="recent-interviews-pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ marginRight: 8 }}>
            Previous
          </button>
          <span style={{ alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages} style={{ marginLeft: 8 }}>
            Next
          </button>
        </div>
      )}
      <InterviewDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        interview={selectedInterview}
      />
      {loadingDetails && <div className="recent-interviews-loading">Loading details...</div>}
    </div>
  );
}

export default RecentInterviews; 