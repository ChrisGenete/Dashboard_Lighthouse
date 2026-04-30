import React, { useCallback, useEffect, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import '../styles/TaskWidget.css';

const normalizeTasks = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.body?.items)) return data.body.items;

  console.warn('Unexpected tasks response shape:', data);
  return [];
};

function TaskWidget() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL || '';

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks`);
      const data = await response.json();
      setTasks(normalizeTasks(data));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setErrorMessage('Unable to load tasks.');
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTask((task) => ({ ...task, [name]: value }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    const title = newTask.title.trim();
    const description = newTask.description.trim();

    if (!title) {
      setErrorMessage('Add a task title first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      const createdTask = await response.json();
      if (!response.ok) {
        throw new Error(createdTask.message || 'Failed to create task.');
      }

      setTasks((currentTasks) => [...currentTasks, createdTask]);
      setNewTask({ title: '', description: '' });
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
  };

  return (
    <div className="widget task-widget">
      <h2>Tasks</h2>

      <form className="task-form" onSubmit={handleCreateTask}>
        <label className="task-field">
          <span>Title</span>
          <input
            name="title"
            type="text"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="New task"
          />
        </label>

        <label className="task-field">
          <span>Description</span>
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Add details"
            rows="3"
          />
        </label>

        <button className="task-submit" type="submit" disabled={isSubmitting}>
          <FaPlus aria-hidden="true" />
          <span>{isSubmitting ? 'Adding...' : 'Add task'}</span>
        </button>
      </form>

      {errorMessage && <div className="task-error">{errorMessage}</div>}

      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task._id || task.title} className={`task-item ${task.status || ''}`}>
              <button
                type="button"
                className="task-detail-trigger"
                onClick={() => setSelectedTask(task)}
              >
                <span className="task-title">{task.title}</span>
                {task.priority && <span className="task-priority">{task.priority}</span>}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="task-empty">No tasks yet.</div>
      )}

      {selectedTask && (
        <div className="task-modal-backdrop" role="presentation" onClick={closeTaskDetails}>
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="task-modal-header">
              <h3 id="task-modal-title">{selectedTask.title}</h3>
              <button
                type="button"
                className="task-modal-close"
                onClick={closeTaskDetails}
                aria-label="Close task details"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            <p className="task-modal-description">
              {selectedTask.description || 'No description added yet.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskWidget;
