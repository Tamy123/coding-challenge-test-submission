// src/hooks/useAddressSearch.ts

import { useState } from 'react';
import { addressApi, isSuccessResponse, getErrorMessage } from '../../core/services/addressApi';
import transformAddress from '../../core/models/address';
import { Address } from '@/types';

interface UseAddressSearchReturn {
  addresses: Address[];
  isLoading: boolean;
  error: string | undefined;
  searchAddresses: (postCode: string, houseNumber: string) => Promise<void>;
  clearResults: () => void;
}

export const useAddressSearch = (): UseAddressSearchReturn => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const clearResults = () => {
    setAddresses([]);
    setError(undefined);
  };

  const searchAddresses = async (postCode: string, houseNumber: string) => {
    // Validation
    if (!postCode || !houseNumber) {
      setError('Please enter both postcode and house number');
      return;
    }

    // Reset state
    clearResults();
    setIsLoading(true);

    try {
      const data = await addressApi.searchAddresses(postCode, houseNumber);

      if (isSuccessResponse(data)) {
        const transformedAddresses = data.details!.map(transformAddress);
        setAddresses(transformedAddresses);
      } else {
        setError(getErrorMessage(data));
      }
    } catch (err) {
      setError('Error fetching addresses. Please try again later.');
      console.error('Address fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addresses,
    isLoading,
    error,
    searchAddresses,
    clearResults,
  };
};