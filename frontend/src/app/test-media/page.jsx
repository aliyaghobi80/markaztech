// مسیر: src/app/test-media/page.jsx
"use client";

import { useState } from "react";

export default function TestMediaPage() {
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, result, success = true) => {
    setTestResults(prev => [...prev, { test, result, success, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testMediaAccess = async () => {
    const mediaUrls = [
      'http://localhost:8000/media/avatars/per.jpg',
      '/media/avatars/per.jpg',
      'http://127.0.0.1:8000/media/avatars/per.jpg'
    ];

    for (const url of mediaUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          addResult(`Media Access: ${url}`, `HTTP ${response.status} - Success`, true);
        } else {
          addResult(`Media Access: ${url}`, `HTTP ${response.status} - ${response.statusText}`, false);
        }
      } catch (error) {
        addResult(`Media Access: ${url}`, `Error: ${error.message}`, false);
      }
    }
  };

  const testImageLoad = () => {
    const urls = [
      'http://localhost:8000/media/avatars/per.jpg',
      'http://127.0.0.1:8000/media/avatars/per.jpg'
    ];

    urls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        addResult(`Image Load: ${url}`, 'Image loaded successfully', true);
      };
      img.onerror = () => {
        addResult(`Image Load: ${url}`, 'Failed to load image', false);
      };
      img.src = url;
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Media Access Test</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testMediaAccess}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Test Media URLs
          </button>
          <button
            onClick={testImageLoad}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Test Image Loading
          </button>
          <button
            onClick={() => setTestResults([])}
            className="btn-secondary px-4 py-2 rounded-lg"
          >
            Clear Results
          </button>
        </div>

        <div className="mb-6 p-4 bg-card border border-border rounded-lg">
          <h3 className="font-bold text-foreground mb-4">Test Images:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-muted mb-2">Full URL:</p>
              <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden border-2 border-border">
                <img 
                  src="http://localhost:8000/media/avatars/per.jpg"
                  alt="Test Full URL" 
                  className="w-full h-full object-cover"
                  onError={() => addResult("Full URL Display", "Failed", false)}
                  onLoad={() => addResult("Full URL Display", "Success", true)}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground-muted mb-2">Relative URL:</p>
              <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden border-2 border-border">
                <img 
                  src="/media/avatars/per.jpg"
                  alt="Test Relative URL" 
                  className="w-full h-full object-cover"
                  onError={() => addResult("Relative URL Display", "Failed", false)}
                  onLoad={() => addResult("Relative URL Display", "Success", true)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Test Results:</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg ${result.success ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-foreground">{result.test}</span>
                  <span className="text-xs text-foreground-muted">{result.timestamp}</span>
                </div>
                <pre className="text-sm text-foreground-muted whitespace-pre-wrap">
                  {result.result}
                </pre>
              </div>
            ))}
            {testResults.length === 0 && (
              <p className="text-foreground-muted text-center py-4">No test results yet. Click a test button above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}