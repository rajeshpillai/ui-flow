// SchemaPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormRenderer from "./components/FormRenderer";
import { loadPageSchema } from "./schema-loader";

interface SchemaPageProps {
  pageKey: string;
}

const SchemaPage: React.FC<SchemaPageProps> = ({ pageKey }) => {
  const [page, setPage] = useState<any>(null);
  const [formDataMap, setFormDataMap] = useState<{ [formId: string]: any }>({});

  useEffect(() => {
    loadPageSchema(pageKey).then((schema) => {
        console.log("Loaded schema for:", pageKey, schema);
        setPage(schema);
      });
  }, [pageKey]);

  const handleFormChange = (formId: string, data: any) => {
    setFormDataMap((prev) => ({ ...prev, [formId]: data }));
  };

  if (!page) return <div className="p-4 text-red-600">Loading page...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{page.title}</h1>
      {page.forms.map((form: any) => (
        <div key={form.id} className="mb-10 border p-4 rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-3">{form.title}</h2>
          <FormRenderer
            schema={form}
            context={formDataMap[form.id] || {}}
            onChange={(data) => handleFormChange(form.id, data)}
          />
        </div>
      ))}
    </div>
  );
};

export default SchemaPage;
