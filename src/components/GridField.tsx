import React, { useState, useEffect } from "react";

export default function GridField({ field, onChange }) {
  const [rows, setRows] = useState([{ id: Date.now(), values: {} }]);
  const [lookupData, setLookupData] = useState({});

  useEffect(() => {
    field.columns.forEach((col) => {
      if (col.lookupUrl && !lookupData[col.name]) {
        fetch(col.lookupUrl)
          .then((res) => res.json())
          .then((data) => {
            setLookupData((prev) => ({ ...prev, [col.name]: data }));
          });
      }
    });
  }, [field.columns]);

  useEffect(() => {
    onChange(rows.map((row) => row.values));
  }, [rows]);

  const handleChange = (rowId, colName, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [colName]: value } } : row
      )
    );
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), values: {} }]);
  };

  const deleteRow = (rowId) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  return (
    <div className="border rounded p-2">
      <table className="table-auto w-full text-sm">
        <thead>
          <tr>
            {field.columns.map((col, i) => (
              <th key={i} className="border px-2 py-1 text-left">{col.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {field.columns.map((col, i) => (
                <td key={i} className="border px-2 py-1">
                  {col.lookupUrl ? (
                    <select
                      className="border p-1 w-full"
                      value={row.values[col.name] || ""}
                      onChange={(e) => handleChange(row.id, col.name, e.target.value)}
                    >
                      <option value="">Select</option>
                      {(lookupData[col.name] || []).map((item, idx) => (
                        <option key={idx} value={item.code}>{item.description}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={col.type === "date" ? "date" : "text"}
                      className="border p-1 w-full"
                      value={row.values[col.name] || ""}
                      onChange={(e) => handleChange(row.id, col.name, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td>
                <button
                  type="button"
                  className="text-red-500 text-sm px-2"
                  onClick={() => deleteRow(row.id)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 px-4 py-1 bg-blue-500 text-white text-sm rounded"
      >
        + Add Row
      </button>
    </div>
  );
}
