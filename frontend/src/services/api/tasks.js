import api from './axios';

export const getTasks = async (projectId = null) => {
  const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
  const response = await api.get(url);
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const getTaskSummary = async () => {
  const response = await api.get('/tasks/summary');
  return response.data;
};
