'use client';

import { useState } from 'react';

type Mode = 'home' | 'income' | 'expense' | 'payable';

export default function Page() {
  const [mode, setMode] = useState<Mode>('home');

  if (mode === 'home') {
    return (
      <main style={styles.page}>
        <h1 style={styles.h1}>Business Checkbook</h1>

        <button style={styles.bigButton} onClick={() => setMode('income')}>
          💰 Scan Income Check
        </button>

        <button style={styles.bigButton} onClick={() => setMode('expense')}>
          🧾 Scan Receipt (Expense)
        </button>

        <button style={styles.bigButton} onClick={() => setMode('payable')}>
          🧾 Write / Track Check
        </button>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <button style={styles.back} onClick={() => setMode('home')}>
        ← Back
      </button>

      {mode === 'income' && <Form title="Income (Check Received)" />}
      {mode === 'expense' && <Form title="Expense (Receipt)" />}
      {mode === 'payable' && <Form title="Check Written (Payable)" />}
    </main>
  );
}

function Form({ title }: { title: string }) {
  return (
    <div style={styles.card}>
      <h2>{title}</h2>

      <input type="file" accept="image/*" capture="environment" style={styles.input} />

      <input placeholder="Amount" style={styles.input} />
      <input placeholder="Who / Store" style={styles.input} />
      <input placeholder="Date" type="date" style={styles.input} />
      <input placeholder="Check Number" style={styles.input} />
      <input placeholder="Memo" style={styles.input} />

      <button style={styles.save}>Save</button>
    </div>
  );
}

const styles: any = {
  page: {
    padding: 20,
    fontFamily: 'Arial',
  },
  h1: {
    marginBottom: 20,
  },
  bigButton: {
    display: 'block',
    width: '100%',
    padding: 20,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 10,
  },
  back: {
    marginBottom: 10,
  },
  card: {
    background: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 10,
    marginBottom: 10,
  },
  save: {
    width: '100%',
    padding: 15,
    background: 'black',
    color: 'white',
    borderRadius: 10,
  },
};
