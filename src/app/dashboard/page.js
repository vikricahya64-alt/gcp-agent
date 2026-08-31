'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleOrchestrate = async () => {
    if (!taskInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskInput })
      });
      const data = await res.json();
      setResult(data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 GCP Agent Dashboard</h1>
          <p className="text-gray-400">AI Orchestration Framework - 100% Gratis</p>
          {!token && (
            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-300 text-sm">⚠️ Mode demo - Login untuk menyimpan task history</p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">📝 Task Input</h2>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Contoh: Buatkan fungsi sorting Python, Analisis data penjualan, Tulis artikel AI"
              className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleOrchestrate}
              disabled={loading}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {loading ? '⏳ Processing...' : '🎯 Orchestrate Task'}
            </button>
          </div>

          {/* Result Panel */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">📊 Hasil Orchestration</h2>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Kategori</p>
                  <p className="text-lg font-semibold text-purple-400">{result.categoryName}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Model</p>
                  <p className="text-lg font-semibold text-blue-400">{result.model}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Provider</p>
                  <p className="text-lg font-semibold text-green-400">{result.provider}</p>
                </div>
                {result.loop && result.loop.length > 0 && (
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Loop Adaptations</p>
                    {result.loop.map((item, i) => (
                      <p key={i} className="text-sm text-yellow-400">• {item.message}</p>
                    ))}
                  </div>
                )}
                {result.aiResponse && (
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">AI Response</p>
                    <pre className="text-sm text-green-400 whitespace-pre-wrap overflow-auto max-h-48">
                      {result.aiResponse}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-4xl mb-4">🤖</p>
                <p>Masukkan task dan klik Orchestrate</p>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Steps */}
        {result && result.workflow && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">🔄 Workflow Steps</h2>
            <div className="grid grid-cols-5 gap-4">
              {result.workflow.steps.map((step, i) => (
                <div key={i} className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-2xl mb-2">{['📋', '🔧', '⚡', '✅', '💾'][i]}</div>
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🌐 Environment (100% Gratis)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <p className="text-3xl mb-2">🐙</p>
              <p className="font-semibold">GitHub</p>
              <p className="text-sm text-gray-400">Source Control</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <p className="text-3xl mb-2">▲</p>
              <p className="font-semibold">Vercel</p>
              <p className="text-sm text-gray-400">Free Hosting</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <p className="text-3xl mb-2">💎</p>
              <p className="font-semibold">Gemini API</p>
              <p className="text-sm text-gray-400">Free Tier AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
