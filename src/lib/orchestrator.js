const categories = [
  { id: 'code', name: 'Code Development', keywords: ['code', 'program', 'debug', 'function', 'python', 'javascript', 'api'] },
  { id: 'analysis', name: 'Data Analysis', keywords: ['data', 'analyze', 'statistics', 'chart', 'graph', 'report'] },
  { id: 'content', name: 'Content Creation', keywords: ['write', 'blog', 'article', 'summarize', 'translate', 'content'] },
  { id: 'design', name: 'Design & UI', keywords: ['design', 'ui', 'ux', 'layout', 'visual', 'website'] },
  { id: 'automation', name: 'Workflow Automation', keywords: ['automate', 'bot', 'api', 'integration', 'workflow'] },
  { id: 'research', name: 'Research & Study', keywords: ['research', 'study', 'learn', 'investigate', 'search'] },
  { id: 'devops', name: 'DevOps & Deployment', keywords: ['deploy', 'ci', 'cd', 'docker', 'server'] },
  { id: 'business', name: 'Business Analysis', keywords: ['business', 'analysis', 'swot', 'market', 'competitor', 'plan'] }
];

const models = [
  { name: 'gemini-3.6-flash', provider: 'Google', type: 'free', cost: 0 },
  { name: 'gemini-3.7-flash', provider: 'Google', type: 'paid', cost: 3.5 },
  { name: 'gemma-4-31b-it', provider: 'Google', type: 'free', cost: 0 },
  { name: 'gemini-3-pro-image', provider: 'Google', type: 'paid', cost: 1 }
];

export class Orchestrator {
  constructor() {
    this.env = {
      github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com',
      vercel: process.env.NEXT_PUBLIC_VERCEL_URL || 'https://vercel.com',
      geminiKey: process.env.GEMINI_API_KEY || '',
      loopEnabled: true
    };
  }

  async orchestrate(task, userId = null) {
    const category = this.selectCategory(task);
    const model = this.selectModel(task);
    const workflow = this.generateWorkflow(category, model);

    const result = {
      task,
      category: category.id,
      categoryName: category.name,
      model: model.name,
      provider: model.provider,
      workflow,
      timestamp: new Date().toISOString()
    };

    if (this.env.loopEnabled) {
      result.loop = this.adaptEnvironment(category, model);
    }

    return result;
  }

  selectCategory(description) {
    const words = description.toLowerCase().split(/\s+/);
    let best = { ...categories[0], score: 0 };

    for (const cat of categories) {
      let score = 0;
      for (const word of words) {
        if (cat.keywords.some(k => word.includes(k) || k.includes(word))) score += 2;
        if (cat.name.toLowerCase().includes(word)) score += 1;
      }
      if (score > best.score) best = { ...cat, score };
    }
    return best;
  }

  selectModel(description) {
    if (!this.env.geminiKey || description.toLowerCase().includes('free')) {
      return models.find(m => m.type === 'free') || models[0];
    }
    return models.find(m => m.type === 'paid') || models[0];
  }

  generateWorkflow(category, model) {
    return {
      steps: [
        { name: 'analyze', status: 'pending', description: 'Menganalisis input task' },
        { name: 'select_tools', status: 'pending', description: 'Memilih tools yang sesuai' },
        { name: 'execute', status: 'pending', description: 'Menjalankan orchestration dengan model ' + model.name },
        { name: 'validate', status: 'pending', description: 'Memvalidasi hasil output' },
        { name: 'store', status: 'pending', description: 'Menyimpan hasil ke database' }
      ],
      tools: this.getTools(category.id),
      model: model.name,
      provider: model.provider,
      environment: {
        github: this.env.github,
        vercel: this.env.vercel,
        gemini: this.env.geminiKey ? 'configured' : 'not_configured'
      }
    };
  }

  getTools(categoryId) {
    const toolMap = {
      code: ['gemini_code_assist', 'github_actions', 'vercel_deploy'],
      analysis: ['pandas', 'gemini_analysis', 'vercel_analytics'],
      content: ['gemini_flash', 'vercel_static'],
      design: ['figma', 'gemini_vision', 'vercel_design'],
      automation: ['github_actions', 'n8n', 'vercel_functions'],
      research: ['google_scholar', 'gemini_research'],
      devops: ['vercel', 'github_actions', 'render'],
      business: ['gemini_advanced', 'vercel_insights']
    };
    return toolMap[categoryId] || ['gemini_default'];
  }

  adaptEnvironment(category, model) {
    const adaptations = [];

    if (!this.env.geminiKey) {
      adaptations.push({ type: 'fallback', message: 'Gemini API key tidak ditemukan, menggunakan model free tier' });
    } else {
      adaptations.push({ type: 'ready', message: 'Gemini API key terkonfigurasi, mode production aktif' });
    }

    if (category.id === 'devops') {
      adaptations.push({ type: 'deploy', message: 'Deploy ke Vercel: push ke branch main' });
    }

    if (category.id === 'code') {
      adaptations.push({ type: 'ci', message: 'GitHub Actions akan trigger CI/CD pipeline' });
    }

    return adaptations;
  }
}

export const orchestrator = new Orchestrator();
