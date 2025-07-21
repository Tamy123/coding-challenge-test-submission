import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import App from './App';
import addressBookReducer from './core/reducers/addressBookSlice';

// Mock dependencies
jest.mock('@/hooks/useAddressBook');
jest.mock('@/hooks/useFormFields');
jest.mock('@/hooks/useAddressSearch');
jest.mock('./core/models/address', () => ({
  __esModule: true,
  default: (address: any) => ({
    ...address,
    id: `${address.lat || Date.now()}_${address.lon || Math.random()}`,
  }),
}));
jest.mock('./core/services/addressApi', () => ({
  addressApi: {
    searchAddresses: jest.fn(),
  },
  isSuccessResponse: jest.fn(),
  getErrorMessage: jest.fn(),
}));

// Helper to render with Redux
const renderApp = () => {
  const store = configureStore({
    reducer: {
      addressBook: addressBookReducer,
    },
  });
  
  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

describe('App', () => {
  // Get mocked modules
  const useFormFields = require('@/hooks/useFormFields').default;
  const useAddressSearch = require('@/hooks/useAddressSearch').useAddressSearch;
  const useAddressBook = require('@/hooks/useAddressBook').default;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default implementation for useFormFields
    useFormFields.mockReturnValue({
      postCode: '',
      houseNumber: '',
      firstName: '',
      lastName: '',
      selectedAddress: '',
      onChange: jest.fn(),
      reset: jest.fn(),
      values: {
        postCode: '',
        houseNumber: '',
        firstName: '',
        lastName: '',
        selectedAddress: '',
      }
    });
    
    // Default implementation for useAddressSearch
    useAddressSearch.mockReturnValue({
      addresses: [],
      isLoading: false,
      error: undefined,
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });
    
    // Default implementation for useAddressBook
    useAddressBook.mockReturnValue({
      addAddress: jest.fn(),
      removeAddress: jest.fn(),
      loadSavedAddresses: jest.fn(),
      loading: false,
    });
  });

  test('renders heading', () => {
    renderApp();
    expect(screen.getByText('Create your own address book!')).toBeInTheDocument();
  });

  test('shows validation error for empty form', () => {
    useAddressSearch.mockReturnValue({
      addresses: [],
      isLoading: false,
      error: 'Please enter both postcode and house number',
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });

    renderApp();
    
    fireEvent.click(screen.getByText('Find'));
    
    expect(screen.getByText('Please enter both postcode and house number')).toBeInTheDocument();
  });

  test('displays addresses after successful search', async () => {
    const mockAddresses = [
      { id: '1', street: 'Test Street', city: 'Test City', postCode: '1234' }
    ];

    useAddressSearch.mockReturnValue({
      addresses: mockAddresses,
      isLoading: false,
      error: undefined,
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });

    renderApp();
    
    expect(screen.getByText(/Test Street/)).toBeInTheDocument();
  });

  test('shows loading state', () => {
    useAddressSearch.mockReturnValue({
      addresses: [],
      isLoading: true,
      error: undefined,
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });

    renderApp();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays API error', () => {
    useAddressSearch.mockReturnValue({
      addresses: [],
      isLoading: false,
      error: 'Error fetching addresses. Please try again later.',
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });

    renderApp();
    
    expect(screen.getByText('Error fetching addresses. Please try again later.')).toBeInTheDocument();
  });

  test('validates personal info', async () => {
    const mockAddresses = [
      { id: '1', street: 'Test Street', city: 'Test City', postCode: '1234' }
    ];

    useAddressSearch.mockReturnValue({
      addresses: mockAddresses,
      isLoading: false,
      error: undefined,
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });

    // Mock form fields to have selected address
    useFormFields.mockReturnValue({
      postCode: '',
      houseNumber: '',
      firstName: '',
      lastName: '',
      selectedAddress: '1', // This makes the form appear
      onChange: jest.fn(),
      reset: jest.fn(),
      values: {
        postCode: '',
        houseNumber: '',
        firstName: '',
        lastName: '',
        selectedAddress: '1',
      }
    });

    renderApp();
    
    // The form should now be visible
    expect(screen.getByText('✏️ Add personal info to address')).toBeInTheDocument();
    
    // Try to submit without names
    fireEvent.click(screen.getByText('Add to addressbook'));
    
    expect(screen.getByText('First name and last name fields mandatory!')).toBeInTheDocument();
  });

  test('clears all fields', () => {
    const mockClearResults = jest.fn();
    const mockReset = jest.fn();

    useAddressSearch.mockReturnValue({
      addresses: [],
      isLoading: false,
      error: undefined,
      searchAddresses: jest.fn(),
      clearResults: mockClearResults,
    });

    useFormFields.mockReturnValue({
      postCode: '1234',
      houseNumber: '10',
      firstName: '',
      lastName: '',
      selectedAddress: '',
      onChange: jest.fn(),
      reset: mockReset,
      values: {
        postCode: '1234',
        houseNumber: '10',
        firstName: '',
        lastName: '',
        selectedAddress: '',
      }
    });

    renderApp();
    
    fireEvent.click(screen.getByText('Clear all fields'));
    
    expect(mockReset).toHaveBeenCalled();
    expect(mockClearResults).toHaveBeenCalled();
  });

  test('submits address with personal info', () => {
    const mockAddAddress = jest.fn();
    const mockAddresses = [
      { id: '1', street: 'Test Street', city: 'Test City', postCode: '1234' }
    ];

    useAddressBook.mockReturnValue({
      addAddress: mockAddAddress,
      removeAddress: jest.fn(),
      loadSavedAddresses: jest.fn(),
      loading: false,
    });

    useAddressSearch.mockReturnValue({
      addresses: mockAddresses,
      isLoading: false,
      error: undefined,
      searchAddresses: jest.fn(),
      clearResults: jest.fn(),
    });

    useFormFields.mockReturnValue({
      postCode: '',
      houseNumber: '',
      firstName: 'John',
      lastName: 'Doe',
      selectedAddress: '1',
      onChange: jest.fn(),
      reset: jest.fn(),
      values: {
        postCode: '',
        houseNumber: '',
        firstName: 'John',
        lastName: 'Doe',
        selectedAddress: '1',
      }
    });

    renderApp();
    
    // The form should be visible
    expect(screen.getByText('✏️ Add personal info to address')).toBeInTheDocument();
    
    // Submit the form
    fireEvent.click(screen.getByText('Add to addressbook'));
    
    expect(mockAddAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        street: 'Test Street',
        city: 'Test City',
        postCode: '1234',
        firstName: 'John',
        lastName: 'Doe',
      })
    );
  });
});