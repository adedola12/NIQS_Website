import { useState, useMemo } from 'react';
import { MdEdit, MdDelete, MdSearch, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const PAGE_SIZE = 10;

export default function DataTable({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  loading = false,
  canDeleteRows = false,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Filter data by search across all string columns
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Reset to page 0 when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(0);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: 16 }}>
          <div style={{ height: 38, background: '#f3f4f6', borderRadius: 6, marginBottom: 16 }} />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 44,
                background: i % 2 === 0 ? '#f9fafb' : '#fff',
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    >
      {/* Search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f9fafb',
            borderRadius: 6,
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <MdSearch size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              width: '100%',
              color: '#111827',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  style={{
                    padding: '10px 14px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 14,
                  }}
                >
                  No data found.
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ padding: '10px 14px', color: '#374151' }}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '--')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          title="Edit"
                          style={{
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: 5,
                            padding: '5px 8px',
                            cursor: 'pointer',
                            color: '#2563EB',
                            marginRight: 6,
                          }}
                        >
                          <MdEdit size={16} />
                        </button>
                      )}
                      {onDelete && canDeleteRows && (
                        <button
                          onClick={() => onDelete(row)}
                          title="Delete"
                          style={{
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: 5,
                            padding: '5px 8px',
                            cursor: 'pointer',
                            color: '#dc2626',
                          }}
                        >
                          <MdDelete size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid #e5e7eb',
            fontSize: 13,
            color: '#6b7280',
          }}
        >
          <span>
            Showing {safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              disabled={safePage === 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 5,
                background: '#fff',
                cursor: safePage === 0 ? 'default' : 'pointer',
                opacity: safePage === 0 ? 0.4 : 1,
              }}
            >
              <MdChevronLeft size={18} />
            </button>
            <span style={{ padding: '4px 10px', lineHeight: '26px' }}>
              {safePage + 1} / {totalPages}
            </span>
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 5,
                background: '#fff',
                cursor: safePage >= totalPages - 1 ? 'default' : 'pointer',
                opacity: safePage >= totalPages - 1 ? 0.4 : 1,
              }}
            >
              <MdChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
