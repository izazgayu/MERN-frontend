import { useState } from 'react';

export function PageHeading({ eyebrow, title, description, actions }) {
  return (
    <div className="portal-heading">
      <div>
        {eyebrow && <small>{eyebrow}</small>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="portal-actions">{actions}</div>}
    </div>
  );
}

export function MetricGrid({ items }) {
  return (
    <div className="portal-metrics">
      {items.map(({ label, value, note, icon: Icon }) => (
        <article className="portal-metric" key={label}>
          <div className="portal-metric-top">
            <span>{label}</span>
            {Icon && <Icon size={18} />}
          </div>
          <strong>{value}</strong>
          {note && <small>{note}</small>}
        </article>
      ))}
    </div>
  );
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`portal-panel ${className}`}>
      {(title || action) && (
        <div className="portal-panel-heading">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function DataTable({ columns, rows, emptyText = 'No records to display.' }) {
  return (
    <div className="portal-table-scroll">
      <table className="portal-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>
              ))}
            </tr>
          )) : (
            <tr><td className="portal-empty" colSpan={columns.length}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ children }) {
  const tone = String(children).toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function SearchBox({ value, onChange, placeholder = 'Search records' }) {
  return (
    <input
      className="portal-search"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export function useSearch() {
  return useState('');
}

export function RevenueChart({ values }) {
  const max = Math.max(...values.map((item) => item.amount), 1);
  return (
    <div className="revenue-chart" role="img" aria-label="Monthly revenue chart">
      {values.map((item) => (
        <div className="revenue-column" key={item.month}>
          <span className="revenue-tooltip">₹{item.amount.toLocaleString('en-IN')}</span>
          <div className="revenue-bar-wrap">
            <div className="revenue-bar" style={{ height: `${Math.max(8, item.amount / max * 100)}%` }} />
          </div>
          <small>{item.month}</small>
        </div>
      ))}
    </div>
  );
}

export function DemoNotice({ children = 'Demo workspace only. Data is saved in this browser and is not protected by a backend.' }) {
  return <div className="portal-demo-notice">{children}</div>;
}
