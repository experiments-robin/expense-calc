import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import GroupView from './GroupView';
import { motion } from 'motion/react';

interface GroupDetailPageProps {
  user: User;
  theme: 'light' | 'dark';
}

export default function GroupDetailPage({ user, theme }: GroupDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter:'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter:'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter:'blur(10px)' }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <GroupView 
        groupId={id} 
        user={user} 
        onBack={() => navigate('/app/dashboard')} 
        theme={theme}
      />
    </motion.div>
  );
}
