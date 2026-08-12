export default function Sidebar({ current, onChange, pages }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">🌾 Farm Admin</div>
      <ul>
        {Object.entries(pages).map(([key, label]) => (
          <li key={key} className={current === key ? 'active' : ''} onClick={() => onChange(key)}>
            {label}
          </li>
        ))}
      </ul>
    </nav>
  );
}
