import { Address } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define a type for the slice state
interface AddressBookState {
  addresses: Address[];
}

// Define the initial state using that type
const initialState: AddressBookState = {
  addresses: [],
};

export const addressBookSlice = createSlice({
  name: "address",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Address>) => {
      /** TODO: Prevent duplicate addresses */
      // Check if an address with the same ID already exists
      const addressExists = state.addresses.some(
        (address) => address.id === action.payload.id
      );
      
      // Only add the address if it doesn't already exist
      if (!addressExists) {
        state.addresses.push(action.payload);
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      /** TODO: Write a state update which removes an address from the addresses array. */
      // Filter out the address with the matching ID
      state.addresses = state.addresses.filter(
        (address) => address.id !== action.payload
      );
    },
    updateAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },
  },
});

export const { addAddress, removeAddress, updateAddresses } =
  addressBookSlice.actions;

// // Other code such as selectors can use the imported `RootState` type
export const selectAddress = (state: RootState) => state.addressBook.addresses;

export default addressBookSlice.reducer;