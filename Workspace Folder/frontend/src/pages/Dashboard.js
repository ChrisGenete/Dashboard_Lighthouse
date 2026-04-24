import React, { useState, useEffect } from 'react';
import RGL, { useContainerWidth } from 'react-grid-layout';
import TaskWidget from '../components/TaskWidget';
import GitHubWidget from '../components/GitHubWidget';
import SpotifyWidget from '../components/SpotifyWidget';
import EmailWidget from '../components/EmailWidget';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/Dashboard.css';

const GridLayout = RGL;

function Dashboard() {
  const { width, containerRef } = useContainerWidth({ measureBeforeMount: false, initialWidth: 1200 });
  const [layout, setLayout] = useState([
    { x: 0, y: 0, w: 4, h: 5, i: 'task', static: false },
    { x: 4, y: 0, w: 4, h: 5, i: 'github', static: false },
    { x: 8, y: 0, w: 4, h: 5, i: 'spotify', static: false },
    { x: 0, y: 5, w: 4, h: 4, i: 'email', static: false }
  ]);

  // Load layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error('Failed to load saved layout:', error);
      }
    }
  }, []);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // Save layout to localStorage
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
  };

  const widgetComponents = {
    task: <TaskWidget />,
    github: <GitHubWidget />,
    spotify: <SpotifyWidget />,
    email: <EmailWidget />
  };

  return (
    <main className="dashboard-container" ref={containerRef}>
      <GridLayout
        className="widgets-grid"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        cols={12}
        rowHeight={60}
        width={width}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se']}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
        measureBeforeMount={false}
      >
        {layout.map((item) => (
          <div key={item.i} className="widget-wrapper">
            {widgetComponents[item.i]}
          </div>
        ))}
      </GridLayout>
    </main>
  );
}

export default Dashboard;
