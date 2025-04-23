import React, { useEffect, useState } from "react";
import GridField from "./GridField";

export default function FieldRenderer({ field, value, error, onChange, context, displayOnly }) {
  const { type, name, label, options = [], required, remoteValidationUrl, visibleIf } = field;
  const [localValue, setLocalValue] = useState(value || "");
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (value !== localValue) setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    if (remoteValidationUrl && localValue) {
      const timeout = setTimeout(() => {
        fetch(`${remoteValidationUrl}?value=${encodeURIComponent(localValue)}`)
          .then(res => res.json())
          .then(data => {
            setValidationError(data.valid ? null : data.message);
          });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [localValue]);

  // Conditional display
  if (visibleIf) {
    const dep = context?.[visibleIf.field];
    if (dep !== visibleIf.value) return null;
  }

  // Display only (calculated field)
  if (displayOnly) {
    return (
      <div className={type === "grid" ? "col-span-2" : ""}>
        <label className="block font-medium mb-1">{label}</label>
        <div className="p-2 bg-gray-100 border rounded">{context?.[name] ?? "-"}</div>
      </div>
    );
  }

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    onChange(name, val);
  };

  const renderField = () => {
    switch (type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return <input type={type} value={localValue} onChange={handleChange} className="border p-2 w-full" />;
      case "dropdown":
        return (
          <select value={localValue} onChange={handleChange} className="border p-2 w-full">
            <option value="">Select {label}</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      case "grid":
        return <GridField field={field} onChange={(val) => onChange(name, val)} />;
      default:
        return <input type="text" value={localValue} onChange={handleChange} className="border p-2 w-full" />;
    }
  };

  return (
    <div className={type === "grid" ? "col-span-2" : ""}>
      <label className="block font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {validationError && <div className="text-red-500 text-sm mt-1">{validationError}</div>}
    </div>
  );
}
