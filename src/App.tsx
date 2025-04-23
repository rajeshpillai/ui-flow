// App.tsx
import React, { useState, useRef } from "react";
import FormRenderer from "./components/FormRenderer";
import inventorySchema from "./schemas/inventory-master.json";
import SchemaDesigner from "./components/SchemaDesigner";

export default function App() {
  const [formData, setFormData] = useState({});
  const formRef = useRef(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [showDetailsInline, setShowDetailsInline] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const detailField = inventorySchema.fields.find(f => f.name === "details");
  const detailConfig = detailField?.config || { display: "inline" };

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
            {detailConfig.display === "tab" && detailField && (
              <button
                type="button"
                className={`px-4 py-2 border rounded ${
                  activeTab === "__DETAILS__" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("__DETAILS__")}
              >
                Details
              </button>
            )}
          </div>

          {activeTab === "__DETAILS__" && detailField ? (
            <FormRenderer
              ref={formRef}
              schema={{ title: "Details", layout: "one-column", fields: [detailField] }}
              onChange={(data) => setFormData({ ...formData, details: data.details })}
              context={formData}
            />
          ) : (
            [...new Set(
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
                      (f) => (f.tab || "General") === activeTab && (f.section || "") === section && f.name !== "details"
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
            ))
          )}

          {detailConfig.display === "inline" && detailField && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowDetailsInline(!showDetailsInline)}
                className="px-4 py-1 bg-indigo-500 text-white text-sm rounded mb-2"
              >
                {showDetailsInline ? "Hide Details" : "Show Details"}
              </button>
              {showDetailsInline && (
                <FormRenderer
                  ref={formRef}
                  schema={{
                    title: "Details",
                    layout: "one-column",
                    fields: [detailField]
                  }}
                  onChange={(data) => setFormData({ ...formData, details: data.details })}
                  context={formData}
                />
              )}
            </div>
          )}

          {detailConfig.display === "popup" && detailField && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowDetailsPopup(true)}
                className="px-4 py-1 bg-indigo-500 text-white text-sm rounded mb-2"
              >
                Show Details (Popup)
              </button>
              {showDetailsPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow-lg w-[90%] max-w-4xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold">Details</h2>
                      <button
                        onClick={() => setShowDetailsPopup(false)}
                        className="text-red-500 font-bold text-xl"
                      >
                        &times;
                      </button>
                    </div>
                    <FormRenderer
                      ref={formRef}
                      schema={{ title: "Details", layout: "one-column", fields: [detailField] }}
                      onChange={(data) => setFormData({ ...formData, details: data.details })}
                      context={formData}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
