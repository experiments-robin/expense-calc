import React, { createContext, useContext, useMemo } from 'react';
import { GroupOperationsModule } from './module';
import { FirebaseGroupAdapter } from './adapters/firebaseAdapter';

interface GroupContextValue {
  groupModule: GroupOperationsModule;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupModule = useMemo(() => {
    const adapter = new FirebaseGroupAdapter();
    return new GroupOperationsModule(adapter);
  }, []);

  return (
    <GroupContext.Provider value={{ groupModule }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupModule = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroupModule must be used within a GroupProvider');
  }
  return context.groupModule;
};
