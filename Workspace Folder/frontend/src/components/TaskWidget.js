import React, { useState, useEffect } from 'react';
import '../styles/TaskWidget.css';

function TaskWidget() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  return (
    <div className="widget task-widget">
      <h2>📋 Tasks</h2>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task._id} className={`task-item ${task.status}`}>
            <span className="task-title">{task.title}</span>
            <span className="task-priority">{task.priority}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskWidget;
