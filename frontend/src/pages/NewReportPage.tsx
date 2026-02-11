import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const NewReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');

  const handleClose = () => {
    navigate('/reports');
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  const handleCreateReport = () => {
    // TODO: Implement create report logic
    console.log({ purpose, date });
    navigate('/reports');
  };

  return (
    <div className="flex flex-col h-screen justify-between" style={{ backgroundColor: '#f6f8f7' }}>
      <main className="flex-grow">
        {/* Header */}
        <header className="p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleClose}
              style={{ color: '#111827' }}
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <h1 className="text-lg font-bold flex-grow text-center" style={{ color: '#111827' }}>
              New Report
            </h1>
            <div className="w-6"></div>
          </div>
        </header>

        {/* Form */}
        <div className="p-4 space-y-6">
          {/* Purpose */}
          <div className="space-y-2">
            <label 
              htmlFor="purpose" 
              className="text-sm font-medium"
              style={{ color: 'rgba(17, 24, 39, 0.8)' }}
            >
              Purpose
            </label>
            <input
              id="purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Q3 Client Meeting"
              className="w-full border-none rounded-lg h-14 px-4 focus:ring-2 focus:outline-none"
              style={{ 
                backgroundColor: '#e5e7eb',
                color: '#111827'
              }}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label 
              htmlFor="date" 
              className="text-sm font-medium"
              style={{ color: 'rgba(17, 24, 39, 0.8)' }}
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-none rounded-lg h-14 px-4 focus:ring-2 focus:outline-none"
              style={{ 
                backgroundColor: '#e5e7eb',
                color: '#111827',
                colorScheme: 'light'
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 pb-8" style={{ backgroundColor: '#f6f8f7' }}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="w-full font-bold h-14 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: '#e5e7eb',
              color: '#111827'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateReport}
            className="w-full font-bold h-14 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: '#40B59D',
              color: '#ffffff'
            }}
          >
            Create Report
          </button>
        </div>
      </footer>
    </div>
  );
};
