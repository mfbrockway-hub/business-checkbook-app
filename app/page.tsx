'use client';

import { useEffect, useMemo, useState } from 'react';

type EntryType = 'income' | 'expense';

type Entry = {
  id: number;
  type: EntryType;
  date: string;
  amount: number;
  who: string;
  category: string;
  checkNumber: string;
  memo: string;
};

const STORAGE_KEY = 'checkbook_entries_v1';
const BALANCE_KEY = 'checkbook_starting_balance_v1';

export default function Page() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [startingBalance, setStartingBalance] = useState('0');
  const [loaded, setLoaded] = useState(false);

  const [type, setType] = useState<EntryType>('income');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [who, setWho] = useState('');
  const [category, setCategory] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);
      const savedBalance = localStorage.getItem(BALANCE_KEY);

      if (savedEntries) setEntries(JSON.parse(savedEntries));
      if (savedBalance) setStartingBalance(savedBalance);
    } catch (e) {
      console.error(e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(BALANCE_KEY, startingBalance);
  }, [startingBalance, loaded]);

  const totals = useMemo(() => {
    const income = entries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const expenses = entries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = Number(startingBalance || 0) + income - expenses;

    return { income, expenses, balance };
  }, [entries, startingBalance]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id
    );
  }, [entries]);

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  function addEntry() {
    if (!date || !amount || !who) {
      alert('Please fill in date, amount, and who/from.');
      return;
    }

    const newEntry: Entry = {
      id: Date.now(),
      type,
      date,
      amount: Number(amount),
      who,
      category,
      checkNumber,
      memo,
    };

    setEntries((prev) => [newEntry, ...prev]);

    setDate('');
    setAmount('');
    setWho('');
    setCategory('');
    setCheckNumber('');
    setMemo('');
  }

  function deleteEntry(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearAll() {
    if (!window.confirm('Delete all entries?')) return;
    setEntries([]);
    setStartingBalance('0');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BALANCE_KEY);
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Business Checkbook</h1>
        <p style={styles.sub}>Simple running ledger for income, expenses, and check tracking.</p>

        <div style={styles.grid3}>
          <div style={styles.card}>
            <div style={styles.label}>Starting Balance</div>
            <input
              style={styles.input}
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div style={styles.card}>
            <div style={styles.label}>Total Income</div>
            <div style={styles.big}>{formatMoney(totals.income)}</div>
          </div>

          <div style={styles.card}>
            <div style={styles.label}>Total Expenses</div>
            <div style={styles.big}>{formatMoney(totals.expenses)}</div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 16 }}>
          <div style={styles.label}>Live Balance</div>
          <div style={styles.big}>{formatMoney(totals.balance)}</div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <h2 style={styles.h2}>Add Entry</h2>

          <div style={styles.row}>
            <button
              style={type === 'income' ? styles.activeButton : styles.button}
              onClick={() => setType('income')}
            >
              Income
            </button>
            <button
              style={type === 'expense' ? styles.activeButton : styles.button}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
          </div>

          <div style={styles.grid2}>
            <div>
              <div style={styles.label}>Date</div>
              <input style={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <div style={styles.label}>Amount</div>
              <input
                style={styles.input}
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div>
              <div style={styles.label}>{type === 'income' ? 'Who From' : 'Paid To / Store'}</div>
              <input
                style={styles.input}
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder={type === 'income' ? 'Customer or tenant' : 'Store or vendor'}
              />
            </div>

            <div>
              <div style={styles.label}>Category</div>
              <input
                style={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Rent, fuel, repairs..."
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div>
              <div style={styles.label}>Check Number</div>
              <input
                style={styles.input}
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <div style={styles.label}>Memo</div>
              <input
                style={styles.input}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="What it was for"
              />
            </div>
          </div>

          <div style={styles.row}>
            <button style={styles.saveButton} onClick={addEntry}>
              Save Entry
            </button>
            <button style={styles.dangerButton} onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <h2 style={styles.h2}>Ledger</h2>

          {sortedEntries.length === 0 ? (
            <div style={styles.empty}>No entries yet.</div>
          ) : (
            sortedEntries.map((entry) => (
              <div key={entry.id} style={styles.entry}>
                <div>
                  <div style={styles.entryTop}>
                    <span style={entry.type === 'income' ? styles.incomeTag : styles.expenseTag}>
                      {entry.type}
                    </span>
                    <span style={styles.small}>{entry.date}</span>
                  </div>
                  <div style={styles.entryWho}>{entry.who}</div>
                  <div style={styles.small}>{entry.category || 'No category'}</div>
                  <div style={styles.small}>{entry.memo || 'No memo'}</div>
                  {entry.checkNumber ? (
                    <div style={styles.small}>Check #{entry.checkNumber}</div>
                  ) : null}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={entry.type === 'income' ? styles.incomeAmt : styles.expenseAmt}>
                    {entry.type === 'income' ? '+' : '-'}
                    {formatMoney(entry.amount)}
                  </div>
                  <button style={styles.deleteButton} onClick={() => deleteEntry(entry.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  wrap: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  h1: {
    fontSize: '32px',
    marginBottom: '6px',
  },
  h2: {
    fontSize: '22px',
    marginTop: 0,
    marginBottom: '16px',
  },
  sub: {
    color: '#475569',
    marginBottom: '20px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  },
  label: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  big: {
    fontSize: '28px',
    fontWeight: 700,
  },
  row: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  button: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
  },
  activeButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #111827',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
  },
  saveButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
  },
  dangerButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #dc2626',
    background: '#fff',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '16px',
  },
  empty: {
    color: '#64748b',
  },
  entry: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '14px',
    paddingBottom: '14px',
  },
  entryTop: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },
  entryWho: {
    fontWeight: 700,
    marginBottom: '4px',
  },
  small: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '3px',
  },
  incomeTag: {
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  expenseTag: {
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  incomeAmt: {
    color: '#15803d',
    fontWeight: 700,
    fontSize: '20px',
    marginBottom: '8px',
  },
  expenseAmt: {
    color: '#dc2626',
    fontWeight: 700,
    fontSize: '20px',
    marginBottom: '8px',
  },
  deleteButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
  },
};
