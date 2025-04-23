// GridField.tsx
import React, { useState, useEffect } from "react";

interface GridFieldProps {
  field: any;
  value: any[];
  onChange: (rows: any[]) => void;
}

const GridField: React.FC<GridFieldProps> = ({ field, value = [], onChange }) => {
  const [rows, setRows] = useState<any[]>(value);

  useEffect(() => {
    onChange(rows);
  }, [rows]);

  const addRow = () => {
    const initial = {};
    field.columns.forEach((col: any) => (initial[col.name] = ""));
    setRows([...rows, initial]);
  };

  const updateCell = (rowIndex: number, key: string, val: any) => {
    const updated = rows.map((row, i) => {
      if (i !== rowIndex) return row;
      const newRow = { ...row, [key]: val };

      // recalculate dependent columns
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

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
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
                      {/* TODO: fetch options from lookupUrl */}
                      <option value="ITEM001">Item 001</option>
                      <option value="ITEM002">Item 002</option>
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
              <td className="border p-2 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(rowIndex)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
