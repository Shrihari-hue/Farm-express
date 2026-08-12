import { useState, useEffect } from 'react';

function blankForm() {
  return {
    customer: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending',
    items: [{ name: '', quantity: 1, unitPrice: 0 }],
    notes: '',
  };
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [search, setSearch] = useState('');

  async function load() {
    setOrders(await window.api.list('orders'));
    setCustomers(await window.api.list('customers'));
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blankForm());
    setModalOpen(true);
  }

  function openEdit(o) {
    setEditing(o);
    setForm({ ...o, items: o.items && o.items.length ? o.items : [{ name: '', quantity: 1, unitPrice: 0 }] });
    setModalOpen(true);
  }

  function updateItem(idx, key, value) {
    const items = [...form.items];
    items[idx] = { ...items[idx], [key]: value };
    setForm({ ...form, items });
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { name: '', quantity: 1, unitPrice: 0 }] });
  }

  function removeItem(idx) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }

  function computeTotal(items) {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  }

  async function handleSave(e) {
    e.preventDefault();
    const total = computeTotal(form.items);
    const payload = { ...form, total };
    if (editing) {
      await window.api.update('orders', editing.id, payload);
    } else {
      await window.api.create('orders', payload);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id) {
    if (confirm('Delete this order?')) {
      await window.api.remove('orders', id);
      load();
    }
  }

  const filtered = orders.filter((o) => !search || JSON.stringify(o).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <div className="page-actions">
          <input
            className="search-input"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openNew}>
            + Add Order
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  No orders yet. Click "+ Add Order" to create one.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.customer || '—'}</td>
                <td>{o.date}</td>
                <td>{(o.items || []).map((it) => it.name).filter(Boolean).join(', ') || '—'}</td>
                <td>${Number(o.total || 0).toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${(o.status || '').toLowerCase().replace(' ', '-')}`}>{o.status}</span>
                </td>
                <td className="actions-col">
                  <button className="btn-icon" onClick={() => openEdit(o)}>
                    Edit
                  </button>
                  <button className="btn-icon btn-danger" onClick={() => handleDelete(o.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Order' : 'Add Order'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Customer</label>
                  <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {['Pending', 'Confirmed', 'Fulfilled', 'Paid', 'Cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className="items-heading">Items</h3>
              <div className="items-table">
                <div className="items-row items-row-head">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Subtotal</span>
                  <span></span>
                </div>
                {form.items.map((it, idx) => (
                  <div className="items-row" key={idx}>
                    <input
                      type="text"
                      placeholder="Item name"
                      value={it.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      step="any"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      step="any"
                      value={it.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                    />
                    <span className="item-subtotal">
                      ${((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)).toFixed(2)}
                    </span>
                    <button type="button" className="btn-icon btn-danger" onClick={() => removeItem(idx)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn" onClick={addItem}>
                + Add Item
              </button>

              <div className="order-total">
                Total: <strong>${computeTotal(form.items).toFixed(2)}</strong>
              </div>

              <div className="form-field">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
