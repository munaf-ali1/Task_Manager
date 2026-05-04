import { useState, useEffect } from 'react';
import { getProjects, createProject, deleteProject } from '../services/api/projects';
import { getAllUsers } from '../services/api/auth';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Users } from 'lucide-react';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  // New Project Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
      
      if (user.role === 'admin') {
        const usersData = await getAllUsers();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject({ title, description, members: selectedMembers });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setSelectedMembers([]);
      fetchData();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  const handleMemberSelection = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedMembers(value);
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="projects-container">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project._id} className="card project-card">
            <div className="project-header">
              <h3 className="project-title">{project.title}</h3>
              {user?.role === 'admin' && (
                <button 
                  className="btn-icon delete" 
                  onClick={() => handleDelete(project._id)}
                  title="Delete Project"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p className="project-desc">{project.description}</p>
            <div className="project-meta">
              <div className="meta-item">
                <Users size={16} />
                <span>{project.members.length} Members</span>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="empty-state">No projects found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Assign Members</label>
                <select
                  multiple
                  className="form-control member-select"
                  value={selectedMembers}
                  onChange={handleMemberSelection}
                >
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <small className="help-text">Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
