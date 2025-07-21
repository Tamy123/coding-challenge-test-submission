// src/services/addressApi.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export interface AddressApiResponse {
  status: 'ok' | 'error';
  details?: any[];
  errormessage?: string;
}

export const addressApi = {
  async searchAddresses(postCode: string, houseNumber: string): Promise<AddressApiResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/getAddresses?postcode=${postCode}&streetnumber=${houseNumber}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }

    return response.json();
  },
};

export const isSuccessResponse = (data: AddressApiResponse): boolean => {
  return data?.status === 'ok' && 
         Array.isArray(data.details) && 
         data.details.length > 0;
};

export const getErrorMessage = (data: AddressApiResponse): string => {
  if (data?.status === 'error') {
    return data.errormessage || 'Error fetching addresses';
  }
  return 'No addresses found for this postcode and house number';
};