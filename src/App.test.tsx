import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import App from './App';
import addressBookReducer from './core/reducers/addressBookSlice';

// Mock dependencies
jest.mock('@/hooks/useAddressBook', () => ({
  __esModule: true,
  default: () => ({
    addAddress: jest.fn(),
    removeAddress: jest.fn(),
    loadSavedAddresses: jest.fn(),
    loading: false,
  }),
}));

jest.mock('./core/models/address', () => ({
  __esModule: true,
  default: (address: any) => ({
    ...address,
    id: `${address.lat || Date.now()}_${address.lon || Math.random()}`,
  }),
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

// Mock fetch
global.fetch = jest.fn();

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders heading', () => {
    renderApp();
    expect(screen.getByText('Create your own address book!')).toBeInTheDocument();
  });

  test('shows error for empty form', () => {
    renderApp();
    
    fireEvent.click(screen.getByText('Find'));
    
    expect(screen.getByText('Please enter both postcode and house number')).toBeInTheDocument();
  });

  test('fetches addresses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        details: [{ street: 'Test Street', city: 'Test City' }]
      }),
    });

    renderApp();
    
    fireEvent.change(screen.getByPlaceholderText('Post Code'), { 
      target: { value: '1234' } 
    });
    fireEvent.change(screen.getByPlaceholderText('House number'), { 
      target: { value: '10' } 
    });
    fireEvent.click(screen.getByText('Find'));
    
    await waitFor(() => {
      expect(screen.getByText(/Test Street/)).toBeInTheDocument();
    });
  });

  test('validates personal info', async () => {
    renderApp();
    
    // Mock successful address fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        details: [{ street: 'Test Street' }]
      }),
    });
    
    // Search for address
    fireEvent.change(screen.getByPlaceholderText('Post Code'), { 
      target: { value: '1234' } 
    });
    fireEvent.change(screen.getByPlaceholderText('House number'), { 
      target: { value: '10' } 
    });
    fireEvent.click(screen.getByText('Find'));
    
    await waitFor(() => {
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });
    
    // Select address
    fireEvent.click(screen.getByRole('radio'));
    
    // Try to submit without names
    fireEvent.click(screen.getByText('Add to addressbook'));
    
    expect(screen.getByText('First name and last name fields mandatory!')).toBeInTheDocument();
  });

  test('clears all fields', () => {
    renderApp();
    
    const postcodeInput = screen.getByPlaceholderText('Post Code');
    const houseNumberInput = screen.getByPlaceholderText('House number');
    
    fireEvent.change(postcodeInput, { target: { value: '1234' } });
    fireEvent.change(houseNumberInput, { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Clear all fields'));
    
    expect(postcodeInput).toHaveValue('');
    expect(houseNumberInput).toHaveValue('');
  });
});