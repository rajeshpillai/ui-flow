// GridField.tsx with backend pagination
import React, { useEffect, useState } from "react";

interface GridFieldProps {
  field: any;
  value: any[];
  onChange: (rows: any[]) => void;
  context?: any;
}

const GridField: React.FC<GridFieldProps> = ({ field, value = [], onChange, context = {} }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = field.config?.pageSize || 10;

  const resolveUrl = (url: string) => {
    return url.replace(/\/:([a-zA-Z0-9_]+)/g, (_, key) =>
      context[key] ? `/${context[key]}` : ""
    );
  };
  

  useEffect(() => {
    if (field.config?.dataUrl && field.config?.pagination) {
      const url = new URL(resolveUrl(field.config.dataUrl));
      url.searchParams.set("page", String(page));
      url.searchParams.set("size", String(pageSize));

      fetch(url.toString())
        .then((res) => res.json())
        .then((data) => {
          setRows(data.items || []);
          setTotalPages(Math.ceil((data.total || 0) / pageSize));
          onChange(data.items || []);
        })
        .catch(() => {
          setRows([]);
          setTotalPages(1);
        });
    } else {
      setRows(value);
    }
  }, [page, value, field.config?.dataUrl]);

  return (
    <div>
      <table className="w-full border text-sm">
        <thead>
          <tr>
            {field.columns.map((col: any) => (
              <th key={col.name} className="border p-2 text-left bg-gray-100">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {field.columns.map((col: any) => (
                <td key={col.name} className="border p-2">{row[col.name]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {field.config?.pagination && (
        <div className="flex justify-between mt-2 text-sm">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GridField;
