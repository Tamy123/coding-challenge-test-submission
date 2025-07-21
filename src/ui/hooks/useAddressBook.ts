import {
  addAddress,
  removeAddress,
  selectAddress,
  updateAddresses,
} from "../../core/reducers/addressBookSlice";
import { Address } from "@/types";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../core/store/hooks";

import transformAddress, { RawAddressModel } from "../../core/models/address";
import databaseService from "../../core/services/databaseService";

export default function useAddressBook() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddress);
  const [loading, setLoading] = React.useState(true);

  // const updateDatabase = React.useCallback(() => {
  //   databaseService.setItem("addresses", addresses);
  // }, [addresses]);

  // Update the database whenever addresses change
  // This is a side effect that ensures the database is always in sync with the Redux store
  React.useEffect(() => {
    // if (addresses.length > 0) {
      // Optional: only update if there are addresses
      databaseService.setItem("addresses", addresses);
    // }
  }, [addresses]);

  return {
    /** Add address to the redux store */
    addAddress: (address: Address) => {
      dispatch(addAddress(address));
      // this was not really updating the database
      // updateDatabase();
    },
    /** Remove address by ID from the redux store */
    removeAddress: (id: string) => {
      dispatch(removeAddress(id));
      // this was not really updating the database
      // updateDatabase();
    },
    /** Loads saved addresses from the indexedDB */
    loadSavedAddresses: async () => {
      const saved: RawAddressModel[] | null = await databaseService.getItem(
        "addresses"
      );
      // No saved item found, exit this function
      if (!saved || !Array.isArray(saved)) {
        setLoading(false);
        return;
      }
      dispatch(
        updateAddresses(saved.map((address) => transformAddress(address)))
      );
      setLoading(false);
    },
    loading,
  };
}
