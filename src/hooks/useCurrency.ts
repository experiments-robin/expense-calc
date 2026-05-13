import { useState, useEffect } from 'react';

export const CURRENCIES: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};

export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    return localStorage.getItem('app_currency') || 'INR';
  });

  const saveCurrency = (code: string) => {
    localStorage.setItem('app_currency', code);
    setCurrencyCode(code);
    window.dispatchEvent(new Event('currencyChange'));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrencyCode(localStorage.getItem('app_currency') || 'INR');
    };
    window.addEventListener('currencyChange', handleStorageChange);
    return () => window.removeEventListener('currencyChange', handleStorageChange);
  }, []);

  return {
    currencyCode,
    currencySymbol: CURRENCIES[currencyCode] || '₹',
    setCurrency: saveCurrency
  };
}
