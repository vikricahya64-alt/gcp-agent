import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Hero */}
      <div className="container mx-auto px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            🚀 <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">GCP Agent</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            AI Orchestration Framework - 100% Gratis dengan GitHub + Vercel + Gemini API
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition">
              🎯 Buka Dashboard
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition border border-gray-600">
              📦 View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">✨ Fitur Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">AI Orchestration</h3>
            <p className="text-gray-400">Otomatis memilih model dan tools terbaik untuk setiap task</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Environment Loop</h3>
            <p className="text-gray-400">Sistem adaptif yang menyesuaikan dengan lingkungan gratis</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-4xl mb-4">🗄️</div>
            <h3 className="text-xl font-semibold mb-2">Database & Auth</h3>
            <p className="text-gray-400">SQLite database dan sistem autentikasi built-in</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">📦 8 Kategori Kerja</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '💻', name: 'Code Development', desc: 'Programming & Debugging' },
            { icon: '📊', name: 'Data Analysis', desc: 'Statistics & Visualization' },
            { icon: '✍️', name: 'Content Creation', desc: 'Writing & Translation' },
            { icon: '🎨', name: 'Design & UI', desc: 'UI/UX & Visual Design' },
            { icon: '⚡', name: 'Automation', desc: 'Workflow & Bot' },
            { icon: '🔬', name: 'Research', desc: 'Study & Investigation' },
            { icon: '🚀', name: 'DevOps', desc: 'CI/CD & Deployment' },
            { icon: '💼', name: 'Business', desc: 'Analysis & Planning' }
          ].map((cat, i) => (
            <div key={i} className="bg-gray-800/30 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500 transition">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="font-semibold text-sm">{cat.name}</p>
              <p className="text-xs text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free Stack */}
      <div className="container mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">💰 100% Gratis Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-5xl mb-4">🐙</div>
            <h3 className="text-xl font-semibold mb-2">GitHub</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Unlimited public repos</li>
              <li>✓ GitHub Actions (2000 min/month)</li>
              <li>✓ GitHub Pages</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-5xl mb-4">▲</div>
            <h3 className="text-xl font-semibold mb-2">Vercel</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Hobby plan free</li>
              <li>✓ 100GB bandwidth/month</li>
              <li>✓ Serverless functions</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-5xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-2">Gemini API</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Free tier available</li>
              <li>✓ 60 RPM / 1500 RPD</li>
              <li>✓ 1M tokens/day</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-8 py-8 border-t border-gray-800">
        <div className="text-center text-gray-500">
          <p>GCP Agent Framework - Made with 💜</p>
          <p className="text-sm mt-2">Orkestrasi kerja nyata dengan 100% lingkungan gratis</p>
        </div>
      </footer>
    </div>
  );
}
