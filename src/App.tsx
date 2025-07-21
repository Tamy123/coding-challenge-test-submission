import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import ErrorMessage from "@/components/Error/Error";
import Form from "@/components/Form/Form";
import useAddressBook from "@/hooks/useAddressBook";
import useFormFields from "@/hooks/useFormFields";
import { useAddressSearch } from "@/hooks/useAddressSearch";

function App() {
  // Using custom hook instead of individual useState
  const formFields = useFormFields({
    postCode: "",
    houseNumber: "",
    firstName: "",
    lastName: "",
    selectedAddress: "",
  });

  // Address search functionality
  const {
    addresses,
    isLoading,
    error: searchError,
    searchAddresses,
    clearResults,
  } = useAddressSearch();

  // Local error state for form validation
  const [validationError, setValidationError] = React.useState<
    string | undefined
  >();

  // Combined error (search or validation)
  const error = searchError || validationError;

  const { addAddress } = useAddressBook();

  const handleAddressSubmit = async () => {
    setValidationError(undefined);
    await searchAddresses(formFields.postCode, formFields.houseNumber);
  };

  // Add validation for first name and last name
  const handlePersonSubmit = () => {
    setValidationError(undefined);

    // Validate name fields
    if (!formFields.firstName.trim() || !formFields.lastName.trim()) {
      setValidationError("First name and last name fields mandatory!");
      return;
    }

    // Validate address selection
    if (!formFields.selectedAddress || !addresses.length) {
      setValidationError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === formFields.selectedAddress
    );

    if (!foundAddress) {
      setValidationError("Selected address not found");
      return;
    }

    // Add to address book
    addAddress({
      ...foundAddress,
      firstName: formFields.firstName,
      lastName: formFields.lastName,
    });
  };

  const handleClearAll = () => {
    formFields.reset();
    clearResults();
    setValidationError(undefined);
  };

  // Form entries for address search
  const addressFormEntries = [
    {
      name: "postCode",
      placeholder: "Post Code",
      extraProps: {
        value: formFields.postCode,
        onChange: formFields.onChange,
      },
    },
    {
      name: "houseNumber",
      placeholder: "House number",
      extraProps: {
        value: formFields.houseNumber,
        onChange: formFields.onChange,
      },
    },
  ];

  // Form entries for personal info
  const personalInfoEntries = [
    {
      name: "firstName",
      placeholder: "First name",
      extraProps: {
        value: formFields.firstName,
        onChange: formFields.onChange,
      },
    },
    {
      name: "lastName",
      placeholder: "Last name",
      extraProps: {
        value: formFields.lastName,
        onChange: formFields.onChange,
      },
    },
  ];

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>

        {/* Using the Form component for address search */}
        <Form
          label="🏠 Find an address"
          loading={isLoading}
          formEntries={addressFormEntries}
          onFormSubmit={handleAddressSubmit}
          submitText="Find"
        />

        {addresses.length > 0 &&
          addresses.map((address) => {
            return (
              <Radio
                name="selectedAddress"
                id={address.id}
                key={address.id}
                onChange={formFields.onChange}
              >
                <Address {...address} />
              </Radio>
            );
          })}

        {/* Using the Form component for personal info */}
        {formFields.selectedAddress && (
          <Form
            label="✏️ Add personal info to address"
            loading={false}
            formEntries={personalInfoEntries}
            onFormSubmit={handlePersonSubmit}
            submitText="Add to addressbook"
          />
        )}

        {/* Using ErrorMessage component */}
        {error && <ErrorMessage error={error} />}

        {/* Clear all fields button */}
        <Button type="button" onClick={handleClearAll} variant="secondary">
          Clear all fields
        </Button>
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
