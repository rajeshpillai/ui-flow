import React, { useState, useRef } from "react";
import FormRenderer from "./components/FormRenderer";
import inventorySchema from "./schemas/inventory-master.json";
import SchemaDesigner from "./components/SchemaDesigner";

export default function App() {
  const [formData, setFormData] = useState({});
  const formRef = useRef(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = formRef.current?.validate();
    if (!isValid) {
      alert("Please fix validation errors.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/save-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      alert("Saved successfully: " + result.message);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to save.");
    }
  };

  const tabs = Array.from(
    new Set(inventorySchema.fields.map((f) => f.tab || "General"))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventory Master</h1>
        <button
          onClick={() => setShowDesigner(!showDesigner)}
          className="px-4 py-1 bg-gray-800 text-white text-sm rounded"
        >
          {showDesigner ? "← Back to Form" : "Schema Designer"}
        </button>
      </div>

      {showDesigner ? (
        <SchemaDesigner />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`px-4 py-2 border rounded ${
                  tab === activeTab ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Group by section inside selected tab */}
          {[...new Set(
            inventorySchema.fields
              .filter((f) => (f.tab || "General") === activeTab)
              .map((f) => f.section || "")
          )].map((section) => (
            <div key={section} className="mb-6">
              {section && <h3 className="text-lg font-semibold mb-2">{section}</h3>}
              <FormRenderer
                ref={formRef}
                schema={{
                  ...inventorySchema,
                  fields: inventorySchema.fields.filter(
                    (f) => (f.tab || "General") === activeTab && (f.section || "") === section
                  )
                }}
                onChange={(data) => {
                  const updated = { ...data };
                  Object.keys(data).forEach((key) => {
                    const field = inventorySchema.fields.find((f) => f.name === key);
                    if (field?.calculated && typeof field.calculated === "string") {
                      try {
                        const calc = new Function(
                          ...Object.keys(data),
                          `return ${field.calculated};`
                        );
                        updated[key] = calc(...Object.values(data));
                      } catch (err) {
                        console.error("Calc error", err);
                      }
                    }
                  });
                  setFormData(updated);
                }}
                context={formData}
                displayOnlyFields={inventorySchema.fields
                  .filter((f) => f.calculated)
                  .map((f) => f.name)}
              />
            </div>
          ))}

          <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
