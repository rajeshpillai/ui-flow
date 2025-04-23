// FormRenderer.tsx
import React, { useRef } from "react";
import { useFormSubmit } from "../hooks/use-form-submit";
import GridField from "./GridField";

interface FormRendererProps {
  schema: any;
  context: any;
  onChange: (data: any) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ schema, context, onChange }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { submitForm } = useFormSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = schema.actions?.submit;
    if (!action || !action.endpoint) {
      console.warn("No submit action defined in schema.");
      return;
    }

    submitForm(context, {
      endpoint: action.endpoint,
      method: action.method || "POST",
      onSuccess: (res) => alert("Saved successfully."),
      onError: (err) => alert("Error saving form.")
    });
  };

  const renderField = (field: any) => {
    if (field.type === "grid") {
      return (
        <div key={field.name} className="col-span-full">
          <label className="font-semibold block mb-1">{field.label}</label>
          <GridField
            field={field}
            value={context[field.name] || []}
            onChange={(rows) => onChange({ ...context, [field.name]: rows })}
          />
        </div>
      );
    }

    if (field.type === "dropdown") {
      return (
        <div key={field.name} className="flex flex-col">
          <label className="font-medium mb-1">{field.label}</label>
          <select
            value={context[field.name] || ""}
            onChange={(e) => onChange({ ...context, [field.name]: e.target.value })}
            className="border rounded p-2"
          >
            <option value="">Select</option>
            {field.options?.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name} className="flex flex-col">
        <label className="font-medium mb-1">{field.label}</label>
        <input
          type={field.type || "text"}
          value={context[field.name] || ""}
          onChange={(e) => onChange({ ...context, [field.name]: e.target.value })}
          className="border rounded p-2"
        />
      </div>
    );
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schema.fields?.map((field: any) => renderField(field))}
      </div>

      {schema.buttons && schema.buttons.length > 0 && (
        <div className="mt-4 flex gap-4">
          {schema.buttons.map((btn: any, idx: number) => (
            <button
              key={idx}
              type={btn.action || "button"}
              className={`px-6 py-2 rounded text-white ${
                btn.style === "primary"
                  ? "bg-green-600"
                  : btn.style === "secondary"
                  ? "bg-gray-500"
                  : "bg-blue-600"
              }`}
              onClick={btn.action === "submit" ? handleSubmit : undefined}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default FormRenderer;