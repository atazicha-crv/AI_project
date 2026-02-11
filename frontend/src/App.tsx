import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StatusPage from './pages/StatusPage';
import { ExpenseReportsPage } from './pages/ExpenseReportsPage';
import { NewReportPage } from './pages/NewReportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reports" replace />} />
        <Route path="/reports" element={<ExpenseReportsPage />} />
        <Route path="/reports/:id" element={<div className="p-8 text-center">Report Details (à implémenter)</div>} />
        <Route path="/reports/new" element={<NewReportPage />} />
        <Route path="/submit" element={<div className="p-8 text-center">Submit (à implémenter)</div>} />
        <Route path="/profile" element={<div className="p-8 text-center">Profile (à implémenter)</div>} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<Navigate to="/reports" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
