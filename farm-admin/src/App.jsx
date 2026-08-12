import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CrudPage from './components/CrudPage.jsx';
import Orders from './pages/Orders.jsx';
import {
  cropsConfig,
  livestockConfig,
  customersConfig,
  expensesConfig,
  staffConfig,
  tasksConfig,
} from './pages/configs.js';

const PAGES = {
  dashboard: 'Dashboard',
  crops: 'Crops',
  livestock: 'Livestock',
  customers: 'Customers',
  orders: 'Orders',
  expenses: 'Expenses',
  staff: 'Staff',
  tasks: 'Tasks',
};

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app">
      <Sidebar current={page} onChange={setPage} pages={PAGES} />
      <main className="content">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'crops' && <CrudPage {...cropsConfig} />}
        {page === 'livestock' && <CrudPage {...livestockConfig} />}
        {page === 'customers' && <CrudPage {...customersConfig} />}
        {page === 'orders' && <Orders />}
        {page === 'expenses' && <CrudPage {...expensesConfig} />}
        {page === 'staff' && <CrudPage {...staffConfig} />}
        {page === 'tasks' && <CrudPage {...tasksConfig} />}
      </main>
    </div>
  );
}
