import React, { useState } from "react";

export default function SchemaDesigner() {
  const [title, setTitle] = useState("Untitled Form");
  const [layout, setLayout] = useState("two-column");
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    tab: "General",
    section: ""
  });
  const [newGridColumns, setNewGridColumns] = useState([]);
  const [tempGridCol, setTempGridCol] = useState({ name: "", label: "", type: "text" });

  const addGridColumn = () => {
    if (!tempGridCol.name || !tempGridCol.label) return;
    setNewGridColumns([...newGridColumns, tempGridCol]);
    setTempGridCol({ name: "", label: "", type: "text" });
  };

  const addField = () => {
    if (!newField.name || !newField.label) return;
    if (newField.type === "grid") {
      setFields([...fields, { ...newField, columns: newGridColumns }]);
      setNewGridColumns([]);
    } else {
      setFields([...fields, { ...newField }]);
    }
    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      tab: "General",
      section: ""
    });
  };

  const deleteField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const exportSchema = (save = false) => {
    const schema = { title, layout, fields };
    if (save) {
      fetch("http://localhost:4000/api/save-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema)
      })
        .then((res) => res.json())
        .then((data) => alert("Schema saved: " + data.message))
        .catch(() => alert("Save failed"));
    } else {
      const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, "_").toLowerCase()}_schema.json`;
      link.click();
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <input className="border p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Form Title" />
        <select className="border p-2" value={layout} onChange={(e) => setLayout(e.target.value)}>
          <option value="one-column">One Column</option>
          <option value="two-column">Two Column</option>
        </select>
      </div>

      <div className="mt-4 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Add Field</h2>
        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2" placeholder="Name" value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} />
          <input className="border p-2" placeholder="Label" value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })} />
          <select className="border p-2" value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="dropdown">Dropdown</option>
            <option value="grid">Grid</option>
          </select>
          <input className="border p-2" placeholder="Tab" value={newField.tab} onChange={(e) => setNewField({ ...newField, tab: e.target.value })} />
          <input className="border p-2" placeholder="Section" value={newField.section} onChange={(e) => setNewField({ ...newField, section: e.target.value })} />
          <label className="flex items-center">
            <input type="checkbox" checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.target.checked })} className="mr-2" />
            Required
          </label>

          {newField.type === "grid" && (
            <div className="col-span-2 border p-2 rounded bg-gray-100">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input placeholder="Col Name" className="border p-1" value={tempGridCol.name} onChange={(e) => setTempGridCol({ ...tempGridCol, name: e.target.value })} />
                <input placeholder="Label" className="border p-1" value={tempGridCol.label} onChange={(e) => setTempGridCol({ ...tempGridCol, label: e.target.value })} />
                <select className="border p-1" value={tempGridCol.type} onChange={(e) => setTempGridCol({ ...tempGridCol, type: e.target.value })}>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>
              <button onClick={addGridColumn} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">+ Add Column</button>
              <ul className="mt-2 text-sm">{newGridColumns.map((col, i) => <li key={i}>{col.name} ({col.type})</li>)}</ul>
            </div>
          )}

          <button onClick={addField} className="col-span-2 bg-green-600 text-white px-4 py-2 rounded">Add Field</button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Schema Preview</h2>
        <ul className="mb-2 text-sm space-y-1">
          {fields.map((field, i) => (
            <li key={i} className="bg-white border px-3 py-1 rounded flex justify-between items-center">
              <span>{field.name} ({field.type})</span>
              <button onClick={() => deleteField(i)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
        <pre className="bg-gray-100 p-4 rounded text-xs max-h-60 overflow-auto">{JSON.stringify({ title, layout, fields }, null, 2)}</pre>
        <div className="mt-2 flex gap-2">
          <button onClick={() => exportSchema(false)} className="bg-blue-700 text-white px-4 py-2 rounded">Download JSON</button>
          <button onClick={() => exportSchema(true)} className="bg-green-700 text-white px-4 py-2 rounded">Save to Server</button>
        </div>
      </div>
    </div>
  );
}
