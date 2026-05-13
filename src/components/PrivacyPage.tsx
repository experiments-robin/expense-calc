import React from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function PrivacyPage({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-white transition-colors duration-300">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center max-w-5xl mx-auto">
        <Link to="/" className="font-bold text-xl font-display">Budgeted</Link>
        <Link to="/" className="text-sm font-medium hover:text-emerald-600 transition-colors">Back Home</Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-zinc dark:prose-invert">
        <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
        <p><strong>Last updated:</strong> Today</p>
        <h2>1. Information We Collect</h2>
        <p>We only collect the information necessary to provide the Budgeted service, such as your email address for authentication and the financial data you choose to log.</p>
        <h2>2. How We Use Information</h2>
        <p>Your data is used strictly for calculating splits, generating insights, and managing your shared groups. We do not sell your data to third parties.</p>
        <h2>3. Demo Limitations</h2>
        <p>Please note that this is a demo environment. <strong>All user data is automatically deleted after 24 hours</strong> of inactivity or since the demo was first accessed to keep the preview fresh.</p>
        <h2>4. Contact</h2>
        <p>If you have any questions, please reach out to us or simply fork the repository.</p>
      </main>
    </div>
  );
}
