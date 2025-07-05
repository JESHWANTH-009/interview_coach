import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Greeting from './Greeting';
import StatsSection from './StatsSection';
import RecentInterviews from './RecentInterviews';
import QuickStart from './QuickStart';
import InterviewSetup from './InterviewSetup';
import './dashboard.css';
import { fetchDashboardData } from '../api';

const icons = {
  interviews: <span role="img" aria-label="target">🎯</span>,
  score: <span role="img" aria-label="chart">📈</span>,
  best: <span role="img" aria-label="star">⭐</span>,
};

const Dashboard = ({ user, onLogout }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardError, setDashboardError] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [showInterviewSetup, setShowInterviewSetup] = useState(false);

    useEffect(() => {
        const getDashboardData = async () => {
            if (!user || !user.uid) {
                setDashboardError('User not found.');
                setDashboardLoading(false);
                return;
            }
            try {
                setDashboardLoading(true);
                setDashboardError(null);
                const data = await fetchDashboardData(user.uid);
                setDashboardData(data);
            } catch (error) {
                setDashboardError(error.response?.data?.detail || error.message || 'Failed to fetch dashboard data.');
            } finally {
                setDashboardLoading(false);
            }
        };
        getDashboardData();
    }, [user]);

    if (dashboardLoading) return <div>Loading...</div>;
    if (dashboardError) return <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{dashboardError}</div>;
    if (!dashboardData) return null;

    const stats = [
        { label: 'Total Interviews', value: dashboardData.total_interviews, icon: icons.interviews },
        { label: 'Average Score', value: dashboardData.average_score + '%', icon: icons.score },
        { label: 'Best Score', value: dashboardData.best_score + '%', icon: icons.best },
    ];

    return (
        <div className="dashboard-bg">
            <Navbar onLogout={onLogout} />
            <div className="dashboard-content">
                <Greeting name={dashboardData.name} />
                <StatsSection stats={stats} />
                <div className="dashboard-main-row">
                    <RecentInterviews
                        interviews={dashboardData.recent_interviews}
                        onViewAll={() => alert('View All Interviews')}
                        onViewDetails={(interview) => alert('View details for ' + interview.title)}
                    />
                    <QuickStart
                        onStartNew={() => setShowInterviewSetup(true)}
                    />
                    </div>
            </div>
            <InterviewSetup open={showInterviewSetup} onClose={() => setShowInterviewSetup(false)} />
        </div>
    );
};

export default Dashboard;