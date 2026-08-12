import { useState, useEffect } from 'react';

export default function CrudPage({ entity, title, columns, formFields, defaultValues = {} }) {
  const [items, setItems] = useState([]);
  const [relatedOptions, setRelatedOptions] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');

  async function load() {
    const list = await window.api.list(entity);
    setItems(list);
  }

  async function loadRelated() {
    const entities = [...new Set(formFields.filter((f) => f.type === 'entitySelect').map((f) => f.entity))];
    const result = {};
    for (const e of entities) {
      result[e] = await window.api.list(e);
    }
    setRelatedOptions(result);
  }

  useEffect(() => {
    load();
    loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  function openNew() {
    setEditing(null);
    setFormData({ ...defaultValues });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setFormData({ ...item });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (editing) {
      await window.api.update(entity, editing.id, formData);
    } else {
      await window.api.create(entity, formData);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(id) {
    if (confirm('Delete this record? This cannot be undone.')) {
      await window.api.remove(entity, id);
      load();
    }
  }

  const filtered = items.filter((item) => {
    if (!search) return true;
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  const singular = title.endsWith('s') ? title.slice(0, -1) : title;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{title}</h1>
        <div className="page-actions">
          <input
            className="search-input"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openNew}>
            + Add {singular}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="empty-row">
                  No records yet. Click "+ Add {singular}" to create one.
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(item) : item[col.key] ?? '—'}</td>
                ))}
                <td className="actions-col">
                  <button className="btn-icon" onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button className="btn-icon btn-danger" onClick={() => handleDelete(item.id)}>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? `Edit ${singular}` : `Add ${singular}`}</h2>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                {formFields.map((field) => (
                  <div className="form-field" key={field.key}>
                    <label>{field.label}</label>
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.key] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={formData[field.key] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'entitySelect' && (
                      <select
                        value={formData[field.key] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {(relatedOptions[field.entity] || []).map((opt) => (
                          <option key={opt.id} value={opt[field.labelKey]}>
                            {opt[field.labelKey]}
                          </option>
                        ))}
                      </select>
                    )}
                    {(!field.type || field.type === 'text') && (
                      <input
                        type="text"
                        value={formData[field.key] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        step="any"
                        value={formData[field.key] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={formData[field.key] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
