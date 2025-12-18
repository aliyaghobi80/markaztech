// مسیر: src/app/test-api/page.jsx
"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function TestApiPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products/");
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testProduct1 = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products/1/");
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/list/");
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">API Test Page</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testProducts}
            disabled={loading}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Test Products List
          </button>
          <button
            onClick={testProduct1}
            disabled={loading}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Test Product ID 1
          </button>
          <button
            onClick={testUsers}
            disabled={loading}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Test Users List
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Result:</h2>
          <pre className="text-sm text-foreground-muted whitespace-pre-wrap overflow-auto max-h-96">
            {loading ? "Loading..." : result || "Click a button to test API"}
          </pre>
        </div>
      </div>
    </div>
  );
}