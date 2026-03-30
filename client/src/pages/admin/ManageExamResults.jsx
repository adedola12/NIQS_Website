import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const EXAM_TYPES = [
  'TPC', 'GDE', 'Professional Interview', 'Logbook Assessment', 'TPC/GDE', 'Other',
];

const STATUS_OPTIONS = ['Published', 'Pending', 'Upcoming'];

const STATUS_COLOR = {
  Published: { color: '#059669', fontWeight: 700 },
  Pending:   { color: '#ca8a04', fontWeight: 700 },
  Upcoming:  { color: '#2563eb', fontWeight: 700 },
};

const emptyForm = {
  examType: 'TPC',
  sitting: '',
  centre: 'Nationwide',
  resultsPublished: '',
  status: 'Pending',
  year: new Date().getFullYear(),
  resultFileUrl: '',
  sortOrder: 0,
};

export default function ManageExamResults() {
  const { admin }                   = useAuth();
  const role                        = admin?.role || '';
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const { data } = await API.get('/exam-results');
      setResults(data.results || []);
    } catch {
      toast.error('Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = row => {
    setEditing(row);
    setForm({
      examType:         row.examType         || 'TPC',
      sitting:          row.sitting          || '',
      centre:           row.centre           || 'Nationwide',
      resultsPublished: row.resultsPublished || '',
      status:           row.status           || 'Pending',
      year:             row.year             || new Date().getFullYear(),
      resultFileUrl:    row.resultFileUrl    || '',
      sortOrder:        row.sortOrder        ?? 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.put(`/exam-results/${editing._id}`, form);
        toast.success('Result updated');
      } else {
        await API.post('/exam-results', form);
        toast.success('Result added');
      }
      setShowModal(false);
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/exam-results/${confirmDelete._id}`);
      toast.success('Result deleted');
      setConfirmDelete(null);
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'examType', label: 'Exam Type',
      render: val => (
        <strong style={{ color: '#0B1F4B', fontSize: 13 }}>{val}</strong>
      ),
    },
    { key: 'sitting', label: 'Sitting', render: val => val || '—' },
    { key: 'centre',  label: 'Centre',  render: val => val || '—' },
    { key: 'resultsPublished', label: 'Results Published', render: val => val || '—' },
    {
      key: 'status', label: 'Status',
      render: val => (
        <span style={STATUS_COLOR[val] || STATUS_COLOR.Pending}>{val}</span>
      ),
    },
    {
      key: 'resultFileUrl', label: 'PDF',
      render: val => val
        ? <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: '#C9974A', fontSize: 12, fontWeight: 600 }}>View ↗</a>
        : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>,
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Published Exam Results"
        subtitle="Add, update or remove entries in the public Published Results table"
        breadcrumbs={['Published Results']}
      />

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>
            All Entries <span style={{ color: '#9ca3af', fontWeight: 400 }}>({results.length})</span>
          </h3>
          <button onClick={openAdd} style={addBtn}>+ Add Result</button>
        </div>

        <DataTable
          columns={columns}
          data={results}
          loading={loading}
          onEdit={openEdit}
          onDelete={row => setConfirmDelete(row)}
          canDeleteRows={canDelete(role)}
        />
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>
            {editing ? 'Edit Result Entry' : 'Add Result Entry'}
          </h3>
          <form onSubmit={handleSubmit}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Exam Type" required>
                <select value={form.examType} required style={inp}
                  onChange={e => setForm({ ...form, examType: e.target.value })}>
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Year">
                <input type="number" value={form.year} style={inp} min={2000} max={2100}
                  onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
              </FormField>
            </div>

            <FormField label="Sitting (e.g. March 2024)" required>
              <input type="text" value={form.sitting} required style={inp} placeholder="e.g. March 2024"
                onChange={e => setForm({ ...form, sitting: e.target.value })} />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Centre">
                <input type="text" value={form.centre} style={inp} placeholder="Nationwide"
                  onChange={e => setForm({ ...form, centre: e.target.value })} />
              </FormField>
              <FormField label="Results Published (e.g. June 2024)">
                <input type="text" value={form.resultsPublished} style={inp} placeholder="e.g. June 2024"
                  onChange={e => setForm({ ...form, resultsPublished: e.target.value })} />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Status" required>
                <select value={form.status} required style={inp}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Sort Order">
                <input type="number" value={form.sortOrder} style={inp} min={0}
                  onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </FormField>
            </div>

            <FormField label="Result PDF / File URL (optional)">
              <input type="url" value={form.resultFileUrl} style={inp} placeholder="https://…"
                onChange={e => setForm({ ...form, resultFileUrl: e.target.value })} />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                Paste a direct link to the PDF or result document. Leave blank if not available.
              </p>
            </FormField>

            {/* Status preview */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Preview</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 13 }}>
                <span><strong>{form.examType}</strong></span>
                <span style={{ color: '#6b7280' }}>{form.sitting}</span>
                <span style={{ color: '#6b7280' }}>{form.centre}</span>
                <span style={STATUS_COLOR[form.status] || STATUS_COLOR.Pending}>{form.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ ...btn, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
              <button type="submit" disabled={submitting}
                style={{ ...btn, background: '#C9974A', color: '#fff', opacity: submitting ? .6 : 1 }}>
                {submitting ? 'Saving…' : editing ? 'Update' : 'Add Entry'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <ModalOverlay onClose={() => setConfirmDelete(null)}>
          <h3 style={{ margin: '0 0 12px', color: '#dc2626' }}>Confirm Delete</h3>
          <p style={{ color: '#374151', fontSize: 14 }}>
            Remove <strong>{confirmDelete.examType}</strong> — {confirmDelete.sitting} from the published results table?
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ ...btn, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...btn, background: '#dc2626', color: '#fff' }}>Delete</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ── Shared sub-components ── */
function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inp    = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btn    = { padding: '10px 22px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const addBtn = { padding: '10px 20px', background: '#C9974A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
