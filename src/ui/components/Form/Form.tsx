import React, { FunctionComponent } from "react";

import Button from "../Button/Button";
import InputText from "../InputText/InputText";
import $ from "./Form.module.css";

type InputTextExtraProps = React.InputHTMLAttributes<HTMLInputElement> & {
  // Any additional custom props that InputText might accept
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

interface FormEntry {
  name: string;
  placeholder: string;
  // This type should cover all different of attribute types
  extraProps: InputTextExtraProps;
}

interface FormProps {
  label: string;
  loading: boolean;
  formEntries: FormEntry[];
  onFormSubmit: () => void;
  submitText: string;
}

const Form: FunctionComponent<FormProps> = ({
  label,
  loading,
  formEntries,
  onFormSubmit,
  submitText,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFormSubmit();
  };
  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>{label}</legend>
        {formEntries.map(({ name, placeholder, extraProps }, index) => (
          <div key={`${name}-${index}`} className={$.formRow}>
            <InputText
              name={name}
              placeholder={placeholder}
              value={extraProps.value || ''} 
              onChange={extraProps.onChange}
            />
          </div>
        ))}

        <Button loading={loading} type="submit">
          {submitText}
        </Button>
      </fieldset>
    </form>
  );
};

export default Form;
