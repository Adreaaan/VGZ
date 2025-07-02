import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = '#f56500' }) => {
  return (
    <div className={`loading-spinner ${size}`} style={{ borderTopColor: color }}>
      <div className="spinner-inner"></div>
    </div>
  );
};

export default React.memo(LoadingSpinner);
