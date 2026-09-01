'use client';

import { useState, useEffect } from 'react';

const FORMAT_OPTIONS = [
  { value: 'auto', label: '🔍 Auto (Deteksi Otomatis)' },
  { value: 'python', label: '🐍 Python (.py)' },
  { value: 'code', label: '💻 JavaScript (.js)' },
  { value: 'html', label: '🌐 HTML (.html)' },
  { value: 'json', label: '📦 JSON (.json)' },
  { value: 'csv', label: '📊 CSV (.csv)' },
  { value: 'sql', label: '🗄️ SQL (.sql)' },
  { value: 'md', label: '📝 Markdown (.md)' },
  { value: 'yaml', label: '⚙️ YAML (.yaml)' },
  { value: 'sh', label: '🐚 Shell (.sh)' },
  { value: 'xml', label: '📄 XML (.xml)' },
  { value: 'txt', label: '📃 Teks (.txt)' }
];

export default function Dashboard() {
  const [taskInput, setTaskInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [artifactTask, setArtifactTask] = useState('');
  const [artifactFormat, setArtifactFormat] = useState('auto');
  const [artifact, setArtifact] = useState(null);
  const [artifactLoading, setArtifactLoading] = useState(false);
  const [artifactError, setArtifactError] = useState(null);

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

  const handleGenerate = async () => {
    if (!artifactTask.trim()) return;
    setArtifactLoading(true);
    setArtifactError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: artifactTask, format: artifactFormat === 'auto' ? null : artifactFormat })
      });
      const data = await res.json();
      if (!data.success) {
        setArtifactError(data.error || 'Gagal generate artifact');
      } else {
        setArtifact(data.artifact);
      }
    } catch (err) {
      setArtifactError('Terjadi kesalahan jaringan');
    }
    setArtifactLoading(false);
  };

  const downloadArtifact = async () => {
    if (!artifact) return;
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: artifactTask, format: artifactFormat === 'auto' ? null : artifactFormat, download: true })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = artifact.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 GCP Agent Dashboard</h1>
          <p className="text-gray-400">AI Orchestration + Generator Artifact File - 100% Gratis</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orchestration Panel */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">🧠 AI Orchestration</h2>
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
              {loading ? '⏳ Processing...' : '🎯 Orchestrate'}
            </button>
          </div>

          {/* Artifact Generator Panel */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">📁 Generate Artifact File</h2>
            <textarea
              value={artifactTask}
              onChange={(e) => setArtifactTask(e.target.value)}
              placeholder="Contoh: Buatkan landing page HTML untuk kafe, Buatkan skrip Python hitung rata-rata, Buatkan file CSV daftar produk"
              className="w-full h-20 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
            />
            <div className="mt-3">
              <label className="text-sm text-gray-400 block mb-1">Format File</label>
              <select
                value={artifactFormat}
                onChange={(e) => setArtifactFormat(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={artifactLoading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {artifactLoading ? '⏳ Generating file...' : '📁 Generate Artifact'}
            </button>
            {artifactError && (
              <p className="mt-3 text-sm text-red-400">{artifactError}</p>
            )}
            {artifact && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-400">File siap:</p>
                    <p className="font-semibold text-blue-400">{artifact.filename}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadArtifact}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">Pratinjau ({artifact.label}):</p>
                  <pre className="text-xs text-green-400 whitespace-pre-wrap overflow-auto max-h-40 bg-black/40 rounded p-2">
                    {artifact.content.slice(0, 2000)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orchestration Result */}
        {result && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">📊 Hasil Orchestration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            {result.workflow && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">🔄 Workflow</p>
                <div className="grid grid-cols-5 gap-4">
                  {result.workflow.steps.map((step, i) => (
                    <div key={i} className="text-center p-3 bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium">{step.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.aiResponse && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">💬 Response AI</p>
                <pre className="text-sm text-green-400 whitespace-pre-wrap overflow-auto max-h-48 bg-black/40 rounded p-3">
                  {result.aiResponse}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Free Environment */}
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
