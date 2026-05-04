import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api/tasks';
import { getProjects } from '../services/api/projects';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Calendar, Clock } from 'lucide-react';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const { user } = useAuth();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        getTasks(),
        getProjects()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setProjectId(task.project?._id || '');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setStatus('Todo');
      setDueDate('');
      setProjectId(projects.length > 0 ? projects[0]._id : '');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = { title, description, status, dueDate: dueDate || null, project: projectId };
      if (editingTask) {
        await updateTask(editingTask._id, taskData);
      } else {
        await createTask(taskData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task._id, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="tasks-container">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button className="btn btn-primary" onClick={() => openModal()} disabled={projects.length === 0}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {projects.length === 0 && (
        <div className="auth-error mb-4">
          You need to be part of a project to create tasks.
        </div>
      )}

      <div className="kanban-board">
        {['Todo', 'In Progress', 'Done'].map(columnStatus => (
          <div key={columnStatus} className="kanban-column">
            <div className="kanban-header">
              <h3>{columnStatus}</h3>
              <span className="task-count">
                {tasks.filter(t => t.status === columnStatus).length}
              </span>
            </div>
            <div className="kanban-tasks">
              {tasks.filter(t => t.status === columnStatus).map(task => (
                <div key={task._id} className="card task-card">
                  <div className="task-header">
                    <h4 className="task-title">{task.title}</h4>
                    <div className="task-actions">
                      <button className="btn-icon edit" onClick={() => openModal(task)}>
                        <Edit2 size={16} />
                      </button>
                      {(user.role === 'admin' || task.createdBy?._id === user._id) && (
                        <button className="btn-icon delete" onClick={() => handleDelete(task._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  
                  <div className="task-meta">
                    <span className="task-project">{task.project?.title}</span>
                    {task.dueDate && (
                      <span className={`task-date ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red' : ''}`}>
                        <Calendar size={14} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="task-footer">
                    <select 
                      className="status-select"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSubmit}>
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
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Project</label>
                <select
                  className="form-control"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                  disabled={editingTask !== null} // Don't allow changing project easily once created
                >
                  <option value="" disabled>Select a project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
