// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SchemaPage from "./schema-page";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/inventory" element={<SchemaPage pageKey="inventory" />} />
        <Route path="/sales-order" element={<SchemaPage pageKey="sales-order" />} />
        <Route path="*" element={<div className="p-4 text-xl">404 - Page not found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
