import { useState, useEffect } from 'react';
import { getTaskSummary } from '../services/api/tasks';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getTaskSummary();
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="auth-error">{error}</div>;

  const getStatusCount = (status) => {
    const item = summary?.statusDistribution?.find((s) => s._id === status);
    return item ? item.count : 0;
  };

  const stats = [
    {
      title: 'Todo Tasks',
      value: getStatusCount('Todo'),
      icon: <AlertCircle size={24} className="text-gray" />,
      color: 'bg-gray'
    },
    {
      title: 'In Progress',
      value: getStatusCount('In Progress'),
      icon: <Clock size={24} className="text-blue" />,
      color: 'bg-blue'
    },
    {
      title: 'Done Tasks',
      value: getStatusCount('Done'),
      icon: <CheckCircle size={24} className="text-green" />,
      color: 'bg-green'
    },
    {
      title: 'Overdue Tasks',
      value: summary?.overdueCount || 0,
      icon: <AlertCircle size={24} className="text-red" />,
      color: 'bg-red'
    }
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon-wrapper ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
