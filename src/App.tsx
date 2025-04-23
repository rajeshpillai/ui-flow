// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SchemaPage from "./schema-page";
import { listAllPages } from "./schema-loader";
import Layout from "./layout"

const App = () => {
  const pages = listAllPages();

  return (
    <Router>
      <Layout>
        <Routes>
          {pages.map((p) => (
            <Route
              key={p.path}
              path={p.path}
              element={<SchemaPage pageKey={p.path.replace(/^\//, "")} />}
            />
          ))}
          <Route path="*" element={<div className="p-4 text-xl">404 - Page not found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
