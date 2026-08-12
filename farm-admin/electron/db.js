const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAULT_DATA = {
  crops: [],
  livestock: [],
  customers: [],
  orders: [],
  expenses: [],
  staff: [],
  tasks: [],
  _nextId: {},
};

let dbPath;
let data;

function getDbPath() {
  if (!dbPath) {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
    dbPath = path.join(userDataPath, 'farm-data.json');
  }
  return dbPath;
}

function save() {
  fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2));
}

function load() {
  const p = getDbPath();
  if (fs.existsSync(p)) {
    try {
      data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch (e) {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } else {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    save();
  }
  for (const key of Object.keys(DEFAULT_DATA)) {
    if (key === '_nextId') continue;
    if (!Array.isArray(data[key])) data[key] = [];
  }
  if (!data._nextId || typeof data._nextId !== 'object') data._nextId = {};
}

function ensureLoaded() {
  if (!data) load();
}

function nextId(entity) {
  ensureLoaded();
  const cur = data._nextId[entity] || 0;
  const next = cur + 1;
  data._nextId[entity] = next;
  return next;
}

function list(entity) {
  ensureLoaded();
  return data[entity] || [];
}

function create(entity, item) {
  ensureLoaded();
  if (!Array.isArray(data[entity])) data[entity] = [];
  const id = nextId(entity);
  const record = { id, createdAt: new Date().toISOString(), ...item };
  data[entity].push(record);
  save();
  return record;
}

function update(entity, id, updates) {
  ensureLoaded();
  const list = data[entity] || [];
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, id };
  save();
  return list[idx];
}

function remove(entity, id) {
  ensureLoaded();
  data[entity] = (data[entity] || []).filter((r) => r.id !== id);
  save();
  return true;
}

function stats() {
  ensureLoaded();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const orders = data.orders || [];
  const expenses = data.expenses || [];
  const crops = data.crops || [];
  const livestock = data.livestock || [];
  const tasks = data.tasks || [];

  const isThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d >= monthStart && d <= now;
  };

  const revenueThisMonth = orders
    .filter((o) => isThisMonth(o.date))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const expensesThisMonth = expenses
    .filter((e) => isThisMonth(e.date))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const lowStockCrops = crops.filter(
    (c) => c.reorderLevel !== undefined && c.reorderLevel !== null && c.reorderLevel !== '' &&
      Number(c.quantity) <= Number(c.reorderLevel)
  );

  const totalLivestock = livestock.reduce((sum, l) => sum + (Number(l.count) || 0), 0);

  const pendingTasks = tasks.filter((t) => t.status !== 'Done');
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now);

  const upcomingTasks = [...pendingTasks]
    .sort((a, b) => new Date(a.dueDate || '2999-01-01') - new Date(b.dueDate || '2999-01-01'))
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  return {
    revenueThisMonth,
    expensesThisMonth,
    netProfitThisMonth: revenueThisMonth - expensesThisMonth,
    lowStockCrops,
    totalLivestock,
    livestockGroups: livestock.length,
    pendingTasksCount: pendingTasks.length,
    overdueTasksCount: overdueTasks.length,
    upcomingTasks,
    recentOrders,
    totalCustomers: (data.customers || []).length,
    totalStaff: (data.staff || []).length,
  };
}

module.exports = { list, create, update, remove, stats };
