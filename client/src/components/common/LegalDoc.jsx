import React from 'react';

/**
 * Typography for the two legal pages.
 *
 * These documents are long, numbered and read rather than skimmed, which is not
 * what the marketing classes in index.css are shaped for. Rather than give the
 * stylesheet a set of rules used by exactly two pages, the handful of pieces
 * they need live here as components: one measure, one scale, one place to
 * change if the Institute's solicitor sends back edits.
 */

/** The reading column. Narrower than `.ct` — legal prose at 1100px is unreadable. */
export function LegalBody({ children }) {
  return (
    <section style={{ background: '#fff' }}>
      <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>{children}</div>
      </div>
    </section>
  );
}

/**
 * The dated header. Two dates, not one: people checking whether a policy changed
 * since they agreed to it need the revision date, and people checking whether it
 * applied to them at the time need the effective date.
 */
export function LegalMeta({ effective, updated }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '.4rem 2rem',
      padding: '1rem 1.2rem', marginBottom: '2.5rem',
      background: 'var(--color-off)', borderRadius: 12,
      border: '1px solid var(--color-bdr)',
      fontSize: '.74rem', color: 'var(--color-txt-2)',
    }}>
      <span><strong style={{ color: 'var(--color-navy)' }}>Effective</strong> {effective}</span>
      <span><strong style={{ color: 'var(--color-navy)' }}>Last updated</strong> {updated}</span>
    </div>
  );
}

/** A numbered top-level clause. The number is generated, so inserting one renumbers the rest. */
export function Clause({ n, title, children }) {
  return (
    <section style={{ marginBottom: '2.6rem' }} id={`clause-${n}`}>
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700,
        color: 'var(--color-navy)', letterSpacing: '-.02em',
        margin: '0 0 .85rem', display: 'flex', gap: '.65rem', alignItems: 'baseline',
      }}>
        <span style={{ color: 'var(--color-gold)', fontVariantNumeric: 'tabular-nums' }}>{n}.</span>
        <span>{title}</span>
      </h2>
      <div style={{ fontSize: '.85rem', lineHeight: 1.75, color: 'var(--color-txt-2)' }}>
        {children}
      </div>
    </section>
  );
}

/** A sub-heading inside a clause. */
export function SubHead({ children }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-heading)', fontSize: '.85rem', fontWeight: 700,
      color: 'var(--color-txt)', margin: '1.4rem 0 .5rem', letterSpacing: '-.01em',
    }}>
      {children}
    </h3>
  );
}

export function P({ children, style }) {
  return <p style={{ margin: '0 0 .9rem', ...style }}>{children}</p>;
}

export function List({ children }) {
  return (
    <ul style={{ margin: '0 0 .9rem', paddingLeft: '1.15rem', display: 'grid', gap: '.4rem' }}>
      {children}
    </ul>
  );
}

export function LI({ children }) {
  return <li style={{ paddingLeft: '.2rem' }}>{children}</li>;
}

/**
 * A two-column table. Legal text is full of "this, for that reason" pairs, and
 * a table says it in half the words a paragraph needs. Scrolls rather than
 * squeezing on a phone.
 */
export function LegalTable({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '0 0 1.2rem' }}>
      <table style={{
        width: '100%', minWidth: 460, borderCollapse: 'collapse', fontSize: '.78rem',
      }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{
                textAlign: 'left', padding: '.6rem .8rem', background: 'var(--color-off)',
                color: 'var(--color-navy)', fontWeight: 700, fontSize: '.7rem',
                textTransform: 'uppercase', letterSpacing: '.06em',
                borderBottom: '1px solid var(--color-bdr)', whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '.6rem .8rem', verticalAlign: 'top', lineHeight: 1.6,
                  borderBottom: '1px solid var(--color-bdr)',
                  color: j === 0 ? 'var(--color-txt)' : 'var(--color-txt-2)',
                  fontWeight: j === 0 ? 600 : 400,
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A pulled-out note — used for the things people most often need to find. */
export function Callout({ children }) {
  return (
    <div style={{
      padding: '1rem 1.15rem', margin: '0 0 1.2rem',
      background: 'var(--color-gold-xl)',
      border: '1px solid var(--color-bdr-gold)', borderRadius: 12,
      fontSize: '.8rem', lineHeight: 1.7, color: 'var(--color-txt-2)',
    }}>
      {children}
    </div>
  );
}
