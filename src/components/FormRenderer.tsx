import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import FieldRenderer from "./FieldRenderer";

const FormRenderer = forwardRef(({ schema, onChange, context, displayOnlyFields = [] }, ref) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    onChange?.(values);
  }, [values]);

  const updateField = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      let valid = true;
      const newErrors = {};
      schema.fields.forEach(field => {
        const value = values[field.name];
        if (field.required && (value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0))) {
          newErrors[field.name] = `${field.label} is required.`;
          valid = false;
        }
      });
      setErrors(newErrors);
      return valid;
    }
  }));

  return (
    <div className={`grid gap-4 grid-cols-${schema.layout === "two-column" ? "2" : "1"}`}>
      {schema.fields.map((field, index) => (
        <FieldRenderer
          key={index}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={updateField}
          context={context}
          displayOnly={displayOnlyFields.includes(field.name)}
        />
      ))}
    </div>
  );
});

export default FormRenderer;
