// GridField.tsx
import React, { useState, useEffect } from "react";

interface GridFieldProps {
  field: any;
  value: any[];
  onChange: (rows: any[]) => void;
}

const GridField: React.FC<GridFieldProps> = ({ field, value = [], onChange }) => {
  const [rows, setRows] = useState<any[]>(value);
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    onChange(rows);
  }, [rows]);

  useEffect(() => {
    field.columns.forEach((col: any) => {
      if (col.type === "dropdown" && col.lookupUrl && !optionsMap[col.name]) {
        fetch(col.lookupUrl)
          .then((res) => res.json())
          .then((data) => {
            setOptionsMap((prev) => ({ ...prev, [col.name]: data }));
          })
          .catch(() => setOptionsMap((prev) => ({ ...prev, [col.name]: [] })));
      }
    });
  }, [field.columns]);

  const validateRow = async (row: any, rowIndex: number) => {
    if (!field.config?.validateUrl) return true;
    try {
      const res = await fetch(field.config.validateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row)
      });
      const result = await res.json();
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [rowIndex]: result.message || "Invalid row" }));
        return false;
      }
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[rowIndex];
        return updated;
      });
      return true;
    } catch (err) {
      setErrors((prev) => ({ ...prev, [rowIndex]: "Server error" }));
      return false;
    }
  };

  const updateCell = (rowIndex: number, key: string, val: any) => {
    const updated = rows.map((row, i) => {
      if (i !== rowIndex) return row;
      const newRow = { ...row, [key]: val };

      field.columns.forEach((col: any) => {
        if (col.calculated) {
          try {
            const calc = new Function(...Object.keys(newRow), `return ${col.calculated}`);
            newRow[col.name] = calc(...Object.values(newRow));
          } catch (e) {
            console.warn("Calculation error:", e);
          }
        }
      });

      return newRow;
    });
    setRows(updated);
  };

  const addRow = () => {
    const initial = {};
    field.columns.forEach((col: any) => (initial[col.name] = ""));
    setRows([...rows, initial]);
  };
  
  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const saveRow = async (row: any, rowIndex: number) => {
    const isValid = await validateRow(row, rowIndex);
    if (isValid) {
      alert("Row is valid and saved.");
    }
  };

  return (
    <div>
      <table className="w-full border text-sm">
        <thead>
          <tr>
            {field.columns.map((col: any) => (
              <th key={col.name} className="border p-2 text-left bg-gray-100">{col.label}</th>
            ))}
            <th className="border p-2 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {field.columns.map((col: any) => (
                <td key={col.name} className="border p-2">
                  {col.type === "dropdown" && col.lookupUrl ? (
                    <select
                      className="border rounded w-full"
                      value={row[col.name] || ""}
                      onChange={(e) => updateCell(rowIndex, col.name, e.target.value)}
                    >
                      <option value="">Select</option>
                      {optionsMap[col.name]?.map((opt: any) => (
                        <option key={opt.code} value={opt.code}>{opt.description}</option>
                      ))}
                    </select>
                  ) : col.calculated ? (
                    <span>{row[col.name]}</span>
                  ) : (
                    <input
                      type={col.type === "number" ? "number" : "text"}
                      className="border rounded w-full"
                      value={row[col.name] || ""}
                      onChange={(e) => updateCell(rowIndex, col.name, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="border p-2 text-center space-x-2">
                {field.config?.rowActions !== false && (
                  <>
                    <button
                      type="button"
                      onClick={() => saveRow(row, rowIndex)}
                      className="text-blue-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {Object.entries(errors).length > 0 && (
        <div className="text-sm text-red-600 mt-2">
          {Object.entries(errors).map(([idx, msg]) => (
            <div key={idx}>Row {+idx + 1}: {msg}</div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addRow}
        className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded"
      >
        Add Row
      </button>
    </div>
  );
};

export default GridField;