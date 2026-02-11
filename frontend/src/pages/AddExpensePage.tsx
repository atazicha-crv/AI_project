import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AddExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Travel');
  const [amount, setAmount] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('Oct 24, 2024');

  const handleClose = () => {
    navigate('/reports');
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log({ category, amount, expenseName, description, expenseDate });
    navigate('/reports');
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  return (
    <div className="flex flex-col h-screen justify-between" style={{ backgroundColor: '#f6f8f7' }}>
      <div>
        {/* Header */}
        <header className="p-4 flex items-center">
          <button 
            onClick={handleClose}
            className="p-2"
            style={{ color: '#121716' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-8" style={{ color: '#121716' }}>
            Add Expense
          </h1>
        </header>

        {/* Main Content */}
        <main className="px-4 space-y-6">
          {/* Category and Amount */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label 
                htmlFor="category" 
                className="block text-sm font-medium mb-1"
                style={{ color: 'rgba(18, 23, 22, 0.8)' }}
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select w-full border-none rounded-lg h-14 px-4 focus:ring-2 focus:outline-none"
                style={{
                  backgroundColor: '#e3e8e7',
                  color: '#121716',
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option>Travel</option>
                <option>Food</option>
                <option>Supplies</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label 
                htmlFor="amount" 
                className="block text-sm font-medium mb-1"
                style={{ color: 'rgba(18, 23, 22, 0.8)' }}
              >
                Amount
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span style={{ color: 'rgba(18, 23, 22, 0.5)' }}>$</span>
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border-none rounded-lg h-14 pl-8 pr-4 focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: '#e3e8e7',
                    color: '#121716'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Expense Name */}
          <div>
            <label 
              htmlFor="expense-name" 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgba(18, 23, 22, 0.8)' }}
            >
              Expense Name <span style={{ color: 'rgba(18, 23, 22, 0.5)' }}>(Optional)</span>
            </label>
            <input
              id="expense-name"
              name="expense-name"
              type="text"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              placeholder="e.g. Client Dinner"
              className="w-full border-none rounded-lg h-14 px-4 focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: '#e3e8e7',
                color: '#121716'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label 
              htmlFor="description" 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgba(18, 23, 22, 0.8)' }}
            >
              Description <span style={{ color: 'rgba(18, 23, 22, 0.5)' }}>(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of the expense"
              rows={3}
              className="w-full border-none rounded-lg p-4 focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: '#e3e8e7',
                color: '#121716'
              }}
            />
          </div>

          {/* File Upload */}
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center" style={{ 
            borderColor: 'rgba(42, 56, 53, 0.3)',
            backgroundColor: 'rgba(227, 232, 231, 0.5)'
          }}>
            <div className="p-3 rounded-full mb-4" style={{ backgroundColor: 'rgba(64, 181, 157, 0.2)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: '#40B59D' }}>
                cloud_upload
              </span>
            </div>
            <p className="font-semibold" style={{ color: '#121716' }}>
              Drag & drop files here
            </p>
            <p className="text-sm" style={{ color: 'rgba(18, 23, 22, 0.6)' }}>
              or click to upload
            </p>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Dates */}
          <div className="space-y-2 pt-2">
            {/* Report Date */}
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#e3e8e7' }}>
              <span style={{ color: '#121716' }}>Report Date</span>
              <span className="font-medium" style={{ color: '#121716' }}>Oct 24, 2024</span>
            </div>

            {/* Expense Date */}
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#e3e8e7' }}>
              <span style={{ color: '#121716' }}>Expense Date</span>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: '#40B59D' }}>Oct 24, 2024</span>
                <span className="material-symbols-outlined" style={{ color: 'rgba(18, 23, 22, 0.6)' }}>
                  arrow_forward_ios
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="p-4" style={{ backgroundColor: '#f6f8f7' }}>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCancel}
            className="w-full font-bold h-14 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: '#e3e8e7',
              color: '#121716'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full font-bold h-14 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: '#40B59D',
              color: '#ffffff'
            }}
          >
            Save
          </button>
        </div>
      </footer>
    </div>
  );
};
