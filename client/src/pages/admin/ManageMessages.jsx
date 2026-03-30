import { useState, useEffect } from 'react';
import { MdMail, MdMarkEmailRead, MdDelete, MdRefresh, MdSearch } from 'react-icons/md';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import AdminHeader from '../../components/admin/AdminHeader';

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | read

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/contact');
      setMessages(data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await API.put(`/contact/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
      if (selected?._id === id) setSelected((s) => ({ ...s, isRead: true }));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this message?')) return;
    try {
      await API.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.isRead) handleMarkRead(msg._id);
  };

  const filtered = messages.filter((m) => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'unread' && !m.isRead) ||
      (filter === 'read' && m.isRead);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <AdminHeader title="Contact Messages" breadcrumbs={['Dashboard', 'Messages']} />

      <div style={{ padding: '24px 28px' }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 14px',
              flex: 1,
              minWidth: 200,
            }}
          >
            <MdSearch size={18} color="#9ca3af" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or subject…"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 13,
                flex: 1,
                color: '#374151',
                background: 'transparent',
              }}
            />
          </div>

          {/* Filter tabs */}
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: filter === f ? '#0B1F4B' : '#e5e7eb',
                background: filter === f ? '#0B1F4B' : '#fff',
                color: filter === f ? '#fff' : '#6b7280',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f === 'unread' ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          <button
            onClick={fetchMessages}
            title="Refresh"
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <MdRefresh size={18} color="#6b7280" />
          </button>
        </div>

        {/* Two-pane layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selected ? '360px 1fr' : '1fr',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {/* Message list */}
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <div style={{ padding: 24, color: '#9ca3af', fontSize: 14 }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 24, color: '#9ca3af', fontSize: 14 }}>No messages found.</div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background:
                      selected?._id === msg._id
                        ? '#f0f4ff'
                        : msg.isRead
                        ? '#fff'
                        : '#fffbeb',
                    borderLeft: msg.isRead ? '3px solid transparent' : '3px solid #C9974A',
                    transition: 'background 0.15s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: msg.isRead ? 400 : 700,
                          fontSize: 14,
                          color: '#111827',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {msg.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#6b7280',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {msg.subject}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                      {!msg.isRead && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#C9974A',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail pane */}
          {selected && (
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {selected.subject}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                    From: <strong>{selected.name}</strong> &lt;{selected.email}&gt;
                    {selected.phone && ` · ${selected.phone}`}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!selected.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(selected._id, e)}
                      title="Mark as read"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid #d1fae5',
                        background: '#ecfdf5',
                        color: '#059669',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      <MdMarkEmailRead size={16} />
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(selected._id, e)}
                    title="Delete"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #fee2e2',
                      background: '#fef2f2',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    <MdDelete size={16} />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      padding: '7px 12px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      color: '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: '20px',
                  fontSize: 14,
                  color: '#374151',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  minHeight: 200,
                }}
              >
                {selected.message}
              </div>

              {/* Reply link */}
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #f3f4f6',
                  background: '#f9fafb',
                }}
              >
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  style={{
                    fontSize: 13,
                    color: '#2563EB',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Reply via email →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
