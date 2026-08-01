import React, { useRef, useState } from 'react';
import { lookupQS } from '../../api/qsApi';

/**
 * Verify a quantity surveyor against the NIQS register.
 *
 * One box: type a membership number and it verifies that member, type a name and
 * it searches the directory. The server decides which, so this component never
 * has to guess at the format of a membership number.
 *
 * Results carry name, number, grade, standing and chapter — no contact details.
 * That projection happens server-side (server/controllers/qsController.js); it is
 * noted here because it is the reason this component cannot show a phone number
 * even if someone later asks it to.
 *
 * The four outcomes are deliberately distinct. "Not connected" and "no match"
 * look the same to a careless implementation and mean opposite things to someone
 * checking whether a practitioner is genuine: one says we cannot answer, the
 * other says the register has no such member.
 */

const STATUS_TONE = {
  active:    { bg: 'rgba(16,122,86,.10)',  fg: '#0d6b4b', label: 'Active' },
  expired:   { bg: 'rgba(181,130,47,.12)', fg: '#8a611f', label: 'Expired' },
  suspended: { bg: 'rgba(199,64,64,.10)',  fg: '#9d2f2f', label: 'Suspended' },
  pending:   { bg: 'var(--color-off)',     fg: 'var(--color-txt-2)', label: 'Pending' },
};

/* The portal's membershipType vocabulary is lowercase ("corporate", "fellow").
   Presentation only — the value itself is passed through untouched. */
const titleCase = (s) => (s ? String(s).replace(/\b\w/g, c => c.toUpperCase()) : null);

function Result({ m }) {
  const tone = STATUS_TONE[m.status] || { bg: 'var(--color-off)', fg: 'var(--color-txt-2)', label: m.status || 'Unknown' };
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
      padding: '.9rem 1rem', border: '1px solid var(--color-bdr)', borderRadius: 10,
      background: 'var(--color-off)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.92rem', color: 'var(--color-navy)' }}>
          {m.fullName || '—'}
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--color-txt-3)', marginTop: 2 }}>
          {[m.membershipNumber, titleCase(m.membershipType), m.chapter && `${m.chapter} Chapter`]
            .filter(Boolean).join(' · ')}
        </div>
      </div>
      <span style={{
        flexShrink: 0, fontSize: '.62rem', fontWeight: 700, letterSpacing: '.07em',
        textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20,
        background: tone.bg, color: tone.fg,
      }}>
        {tone.label}
      </span>
    </div>
  );
}

export default function MemberLookup() {
  const [q, setQ] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const abortRef = useRef(null);

  async function run(e) {
    e?.preventDefault();
    const term = q.trim();
    if (!term) return;

    // A second submit while the first is in flight would otherwise let the
    // slower response overwrite the newer one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'searching' });
    try {
      const r = await lookupQS(term, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (r.error)            setState({ status: 'error', message: r.error });
      else if (!r.configured) setState({ status: 'unconfigured' });
      else if (!r.results.length) setState({ status: 'empty', term });
      else setState({ status: 'done', results: r.results, mode: r.mode, total: r.total, term });
    } catch {
      /* aborted by a newer search — the newer one owns the state now */
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-bdr)', borderRadius: 14, padding: '2rem' }}>
      <form onSubmit={run}>
        <div className="fg">
          <label className="flbl" htmlFor="qs-lookup">Name or Membership Number</label>
          <input
            id="qs-lookup"
            type="text"
            className="fi"
            placeholder="e.g. NIQS/12345 or Jane Doe"
            value={q}
            onChange={e => setQ(e.target.value)}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="bsub"
          disabled={!q.trim() || state.status === 'searching'}
          style={{ opacity: !q.trim() || state.status === 'searching' ? .5 : 1 }}
        >
          {state.status === 'searching' ? 'Searching…' : 'Search Register'}
        </button>
      </form>

      <div aria-live="polite">
        {state.status === 'done' && (
          <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--color-txt-3)' }}>
              {state.mode === 'verify'
                ? 'Membership confirmed against the NIQS register.'
                : `${state.total} ${state.total === 1 ? 'match' : 'matches'} in the register.`}
            </div>
            {state.results.map(m => <Result key={m.membershipNumber || m.fullName} m={m} />)}
            <p style={{ fontSize: '.68rem', color: 'var(--color-txt-3)', margin: '.2rem 0 0', lineHeight: 1.6 }}>
              Name, grade, standing and chapter only. Contact details are not published —
              reach members through the Secretariat.
            </p>
          </div>
        )}

        {state.status === 'empty' && (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-txt-2)', fontSize: '.78rem', lineHeight: 1.7 }}>
            No active member matches “{state.term}”. Check the spelling or the membership
            number — and note that only members in good standing are listed here.
          </p>
        )}

        {state.status === 'error' && (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-txt-2)', fontSize: '.78rem' }}>
            {state.message}
          </p>
        )}

        {/* Not the same as "no match": the register could not be asked at all. */}
        {state.status === 'unconfigured' && (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-txt-3)', fontSize: '.76rem', lineHeight: 1.7 }}>
            Online verification against the member register is not yet available.
            Please contact the Secretariat to confirm a practitioner's membership.
          </p>
        )}
      </div>
    </div>
  );
}
