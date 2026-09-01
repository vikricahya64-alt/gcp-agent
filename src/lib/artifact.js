const FORMATS = {
  code: { ext: 'js', mime: 'text/javascript', label: 'JavaScript Code' },
  python: { ext: 'py', mime: 'text/x-python', label: 'Python Code' },
  html: { ext: 'html', mime: 'text/html', label: 'HTML Website' },
  css: { ext: 'css', mime: 'text/css', label: 'CSS Stylesheet' },
  json: { ext: 'json', mime: 'application/json', label: 'JSON Data' },
  xml: { ext: 'xml', mime: 'application/xml', label: 'XML Document' },
  csv: { ext: 'csv', mime: 'text/csv', label: 'CSV Spreadsheet' },
  md: { ext: 'md', mime: 'text/markdown', label: 'Markdown Document' },
  txt: { ext: 'txt', mime: 'text/plain', label: 'Plain Text' },
  pdf: { ext: 'pdf', mime: 'application/pdf', label: 'PDF' },
  sql: { ext: 'sql', mime: 'application/sql', label: 'SQL Script' },
  yaml: { ext: 'yaml', mime: 'text/yaml', label: 'YAML Config' },
  toml: { ext: 'toml', mime: 'text/toml', label: 'TOML Config' },
  ini: { ext: 'ini', mime: 'text/plain', label: 'INI Config' },
  env: { ext: 'env', mime: 'text/plain', label: 'Env Variables' },
  bat: { ext: 'bat', mime: 'application/bat', label: 'Batch Script' },
  sh: { ext: 'sh', mime: 'application/x-sh', label: 'Shell Script' },
  dockerfile: { ext: 'Dockerfile', mime: 'text/plain', label: 'Dockerfile' },
  makefile: { ext: 'Makefile', mime: 'text/plain', label: 'Makefile' }
};

export const ARTIFACT_FORMATS = Object.keys(FORMATS);

export function detectFormat(task, requestedFormat = null) {
  if (requestedFormat && FORMATS[requestedFormat]) {
    return { id: requestedFormat, ...FORMATS[requestedFormat] };
  }

  const lower = task.toLowerCase();
  const rules = [
    { format: 'python', keywords: ['python', 'py'] },
    { format: 'html', keywords: ['html', 'website', 'web page', 'halaman web', 'landing page'] },
    { format: 'json', keywords: ['json', 'api response', 'struktur data'] },
    { format: 'csv', keywords: ['csv', 'spreadsheet', 'tabel data', 'standar tabel'] },
    { format: 'sql', keywords: ['sql', 'database', 'query', 'kueri'] },
    { format: 'dockerfile', keywords: ['dockerfile', 'docker'] },
    { format: 'yaml', keywords: ['yaml', 'yml'] },
    { format: 'sh', keywords: ['shell script', 'bash', 'bash script'] },
    { format: 'md', keywords: ['markdown', 'readme', 'dokumentasi', 'README'] },
    { format: 'code', keywords: ['javascript', 'js', 'function', 'code', 'program', 'script'] }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return { id: rule.format, ...FORMATS[rule.format] };
    }
  }

  return { id: 'txt', ...FORMATS.txt };
}

export function buildArtifact({ task, format, content }) {
  const fmt = format || detectFormat(task);
  const filename = slugify(task) + '.' + fmt.ext;
  return {
    filename,
    mime: fmt.mime,
    label: fmt.label,
    format: fmt.id,
    content
  };
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'artifact';
}
