import { useState, useEffect } from 'react';

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className={`stat-card ${highlight === 'good' ? 'stat-good' : ''} ${highlight === 'bad' ? 'stat-bad' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    window.api.stats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <StatCard label="Revenue (this month)" value={`$${stats.revenueThisMonth.toFixed(2)}`} />
        <StatCard label="Expenses (this month)" value={`$${stats.expensesThisMonth.toFixed(2)}`} />
        <StatCard
          label="Net Profit (this month)"
          value={`$${stats.netProfitThisMonth.toFixed(2)}`}
          highlight={stats.netProfitThisMonth >= 0 ? 'good' : 'bad'}
        />
        <StatCard label="Livestock on Farm" value={stats.totalLivestock} />
        <StatCard
          label="Pending Tasks"
          value={stats.pendingTasksCount}
          sub={stats.overdueTasksCount > 0 ? `${stats.overdueTasksCount} overdue` : null}
        />
        <StatCard label="Customers" value={stats.totalCustomers} />
      </div>

      {stats.lowStockCrops.length > 0 && (
        <div className="alert-box">
          <strong>Low Stock Alert:</strong> {stats.lowStockCrops.map((c) => c.name).join(', ')}{' '}
          {stats.lowStockCrops.length === 1 ? 'is' : 'are'} running low.
          <button className="link-btn" onClick={() => onNavigate('crops')}>
            View Crops →
          </button>
        </div>
      )}

      <div className="dashboard-columns">
        <div className="dashboard-card">
          <h2>Upcoming Tasks</h2>
          {stats.upcomingTasks.length === 0 && <p className="muted">No pending tasks.</p>}
          <ul className="simple-list">
            {stats.upcomingTasks.map((t) => (
              <li key={t.id}>
                <span>{t.title}</span>
                <span className="muted">
                  {t.dueDate || 'No due date'} · {t.assignedTo || 'Unassigned'}
                </span>
              </li>
            ))}
          </ul>
          <button className="link-btn" onClick={() => onNavigate('tasks')}>
            View All Tasks →
          </button>
        </div>

        <div className="dashboard-card">
          <h2>Recent Orders</h2>
          {stats.recentOrders.length === 0 && <p className="muted">No orders yet.</p>}
          <ul className="simple-list">
            {stats.recentOrders.map((o) => (
              <li key={o.id}>
                <span>
                  {o.customer || 'Unknown'} — ${Number(o.total || 0).toFixed(2)}
                </span>
                <span className="muted">
                  {o.date} · {o.status}
                </span>
              </li>
            ))}
          </ul>
          <button className="link-btn" onClick={() => onNavigate('orders')}>
            View All Orders →
          </button>
        </div>
      </div>
    </div>
  );
}
