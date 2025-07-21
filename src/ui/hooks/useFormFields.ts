import { useState, ChangeEvent } from 'react';

interface FormFields {
  postCode: string;
  houseNumber: string;
  firstName: string;
  lastName: string;
  selectedAddress: string;
}

interface UseFormFieldsReturn extends FormFields {
  values: FormFields;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

const useFormFields = (initialState: FormFields): UseFormFieldsReturn => {
  const [values, setValues] = useState<FormFields>(initialState);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const reset = () => {
    setValues(initialState);
  };

  return {
    values,
    onChange,
    reset,
    // Return individual field values for convenience
    postCode: values.postCode,
    houseNumber: values.houseNumber,
    firstName: values.firstName,
    lastName: values.lastName,
    selectedAddress: values.selectedAddress,
  };
};

export default useFormFields;