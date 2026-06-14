import { useContext } from 'react';
import { AccountContext } from '../context/accountContext.js';

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return value;
}
