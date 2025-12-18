// مسیر: src/app/test-avatar/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

export default function TestAvatarPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, result, success = true) => {
    setTestResults(prev => [...prev, { test, result, success, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testAvatarAccess = async () => {
    if (!user?.avatar) {
      addResult("Avatar URL Check", "No avatar URL found in user data", false);
      return;
    }

    addResult("Avatar URL", user.avatar, true);

    // Test if the image can be loaded
    const img = new Image();
    img.onload = () => {
      addResult("Image Load Test", "Avatar image loaded successfully", true);
    };
    img.onerror = () => {
      addResult("Image Load Test", "Failed to load avatar image", false);
    };
    img.src = user.avatar;

    // Test direct API call
    try {
      const response = await fetch(user.avatar);
      if (response.ok) {
        addResult("Direct Fetch Test", `HTTP ${response.status} - ${response.statusText}`, true);
      } else {
        addResult("Direct Fetch Test", `HTTP ${response.status} - ${response.statusText}`, false);
      }
    } catch (error) {
      addResult("Direct Fetch Test", `Error: ${error.message}`, false);
    }
  };

  const testProfileAPI = async () => {
    try {
      const response = await api.get("/users/profile/");
      addResult("Profile API", JSON.stringify(response.data, null, 2), true);
    } catch (error) {
      addResult("Profile API", `Error: ${error.message}`, false);
    }
  };

  useEffect(() => {
    if (user) {
      addResult("User Data", JSON.stringify(user, null, 2), true);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Avatar Test Page</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testAvatarAccess}
            className="btn-primary px-4 py-2 rounded-lg"
            disabled={!user?.avatar}
          >
            Test Avatar Access
          </button>
          <button
            onClick={testProfileAPI}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Test Profile API
          </button>
          <button
            onClick={() => setTestResults([])}
            className="btn-secondary px-4 py-2 rounded-lg"
          >
            Clear Results
          </button>
        </div>

        {user?.avatar && (
          <div className="mb-6 p-4 bg-card border border-border rounded-lg">
            <h3 className="font-bold text-foreground mb-2">Current Avatar:</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary rounded-full overflow-hidden border-2 border-border">
                <img 
                  src={user.avatar} 
                  alt="Test Avatar" 
                  className="w-full h-full object-cover"
                  onError={() => addResult("Avatar Display", "Failed to display avatar", false)}
                  onLoad={() => addResult("Avatar Display", "Avatar displayed successfully", true)}
                />
              </div>
              <div>
                <p className="text-sm text-foreground-muted">URL: {user.avatar}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Test Results:</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg ${result.success ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-foreground">{result.test}</span>
                  <span className="text-xs text-foreground-muted">{result.timestamp}</span>
                </div>
                <pre className="text-sm text-foreground-muted whitespace-pre-wrap overflow-auto">
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