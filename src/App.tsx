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

import { Address as AddressType } from "./types";
import transformAddress from "./core/models/address";

function App() {
  /**
   * Form fields states
   * TODO: Write a custom hook to set form fields in a more generic way:
   * - Hook must expose an onChange handler to be used by all <InputText /> and <Radio /> components
   * - Hook must expose all text form field values, like so: { postCode: '', houseNumber: '', ...etc }
   * - Remove all individual React.useState
   * - Remove all individual onChange handlers, like handlePostCodeChange for example
   */
  
  // Using custom hook instead of individual useState
  const formFields = useFormFields({
    postCode: "",
    houseNumber: "",
    firstName: "",
    lastName: "",
    selectedAddress: "",
  });

  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const { addAddress } = useAddressBook();

  // TODO: Fetch addresses implementation
  const handleAddressSubmit = async () => {
    // e.preventDefault();

    // Clear previous results and errors
    setAddresses([]);
    setError(undefined);

    if (!formFields.postCode || !formFields.houseNumber) {
      setError("Please enter both postcode and house number");
      return;
    }

    setIsLoading(true);

    
    try {
      // Provide BASE URL for API endpoint
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/getAddresses?postcode=${formFields.postCode}&streetnumber=${formFields.houseNumber}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();

      // Check if we have a successful response with details
      if (data && data.status === "ok" && data.details && Array.isArray(data.details) && data.details.length > 0) {
        // Transform addresses and add house number
        const transformedAddresses = data.details.map((addr: any) =>
          transformAddress(addr)
        );
        setAddresses(transformedAddresses);
      } else if (data && data.status === "error") {
        setError(data.errormessage || "Error fetching addresses");
      } else {
        setError("No addresses found for this postcode and house number");
      }
    } catch (err) {
      setError("Error fetching addresses. Please try again later.");
      console.error("Address fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add validation for first name and last name
  // Add validation for first name and last name - without event parameter
  const handlePersonSubmit = () => {
    // Validate first name and last name
    if (!formFields.firstName.trim() || !formFields.lastName.trim()) {
      setError("First name and last name fields mandatory!");
      return;
    }

    if (!formFields.selectedAddress || !addresses.length) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === formFields.selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({
      ...foundAddress,
      firstName: formFields.firstName,
      lastName: formFields.lastName,
    });

    // Clear form after successful submission
    // handleClearAll();
  };

  // TODO: Clear all fields function
  const handleClearAll = () => {
    formFields.reset();
    setAddresses([]);
    setError(undefined);
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

        {/* TODO: Clear all fields button */}
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
