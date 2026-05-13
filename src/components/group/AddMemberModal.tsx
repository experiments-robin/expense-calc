import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkle as Sparkles, Spinner as Loader2 } from '@phosphor-icons/react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export default function AddMemberModal({ isOpen, onClose, groupId }: AddMemberModalProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);

    // Simulate sending invite
    setTimeout(() => {
      setInviteLoading(false);
      setInviteSuccess(true);
      setNewMemberEmail('');
      setTimeout(() => {
        onClose();
        setInviteSuccess(false);
      }, 2000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-member-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 outline-none"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 id="add-member-title" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Invite Member</h3>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">Enter the email address of the person you want to add.</p>
            
            {inviteError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Member added successfully!
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Email Address</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => {
                    setNewMemberEmail(e.target.value);
                    setInviteError(null);
                  }}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium dark:text-white"
                  placeholder="friend@example.com"
                  required
                  disabled={inviteLoading || inviteSuccess}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading || inviteSuccess}
                className="w-full py-4 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] dark:active:scale-95"
              >
                {inviteLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Group'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
