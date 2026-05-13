import React from 'react';
import { Link } from 'react-router-dom';

export default function FAQPage({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) {
  const faqs = [
    {
      q: "Is Budgeted really free?",
      a: "Yes! The core functionality to track expenses and manage groups is entirely free to use."
    },
    {
      q: "Why does my data disappear?",
      a: "If you are using the public demo link, all data is automatically erased every 24 hours. To build your own persistent version, simply Remix the code!"
    },
    {
      q: "Can I use it for my household?",
      a: "Absolutely. Budgeted is perfect for roommates, couples, and family households where bills need to be tracked and split."
    },
    {
      q: "Does it support different currencies?",
      a: "By default, budgeting logic is numeric. Currency support can be expanded in your Settings menu."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-white transition-colors duration-300">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center max-w-5xl mx-auto">
        <Link to="/" className="font-bold text-xl font-display">Budgeted</Link>
        <Link to="/" className="text-sm font-medium hover:text-emerald-600 transition-colors">Back Home</Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-display font-bold mb-12 text-center">Frequently Asked Questions</h1>
        <div className="space-y-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold mb-3">{faq.q}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
