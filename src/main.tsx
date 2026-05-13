import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { ExpenseProvider } from './domain/expenses/context.tsx';
import { GroupProvider } from './domain/groups/context.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <GroupProvider>
          <ExpenseProvider>
            <App />
          </ExpenseProvider>
        </GroupProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
