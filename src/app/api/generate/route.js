import { callGemini } from '@/lib/gemini';
import { detectFormat, buildArtifact, ARTIFACT_FORMATS } from '@/lib/artifact';

export async function POST(request) {
  try {
    const { task, format, download } = await request.json();

    if (!task) {
      return Response.json({ error: 'Task description diperlukan' }, { status: 400 });
    }

    const detected = detectFormat(task, format);

    const prompt = buildPrompt(task, detected.id);

    const aiResult = await callGemini(prompt, { model: 'gemini-3.6-flash', temperature: 0.4, maxTokens: 4096 });

    if (!aiResult.success && !aiResult.response) {
      return Response.json({ error: aiResult.error || 'AI gagal menghasilkan artifact' }, { status: 500 });
    }

    const artifact = buildArtifact({ task, format: detected, content: aiResult.response });

    if (download) {
      return new Response(artifact.content, {
        headers: {
          'Content-Type': artifact.mime,
          'Content-Disposition': `attachment; filename="${artifact.filename}"`
        }
      });
    }

    return Response.json({
      success: true,
      artifact: {
        filename: artifact.filename,
        format: artifact.format,
        label: artifact.label,
        mime: artifact.mime,
        content: artifact.content
      },
      model: aiResult.model,
      keyUsed: aiResult.keyUsed || null,
      fallback: !aiResult.success
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: 'GCP Agent Artifact Generator',
    usage: 'POST dengan body { "task": "deskripsi", "format": "opsional", "download": "true utk unduh langsung" }',
    supportedFormats: ARTIFACT_FORMATS
  });
}

function buildPrompt(task, formatId) {
  const instructions = {
    python: 'Buatkan skrip Python yang lengkap dan siap pakai. Berikan hanya kode Python, tanpa penjelasan di luar blok kode.',
    code: 'Buatkan kode JavaScript yang lengkap dan siap pakai. Berikan hanya kode, tanpa penjelasan.',
    html: 'Buatkan file HTML lengkap dan siap pakai (dengan struktur HTML5 yang valid, CSS internal, js internal). Tampilkan hasil dengan desain profesional.',
    json: 'Buatkan data JSON yang valid dan terstruktur. Berikan hanya JSON murni tanpa teks tambahan.',
    csv: 'Buatkan data CSV yang valid dengan header yang jelas. Gunakan koma sebagai pemisah dan baris baru antar record.',
    sql: 'Buatkan skrip SQL yang lengkap dan siap dijalankan (CREATE TABLE dan INSERT jika relevan).',
    md: 'Buatkan dokumen Markdown yang rapi dan terstruktur.',
    txt: 'Buatkan dokumen teks yang jelas dan terstruktur.',
    sh: 'Buatkan skrip shell yang lengkap dan siap dijalankan, dengan shebang dan komentar.',
    yaml: 'Buatkan file konfigurasi YAML yang valid.',
    xml: 'Buatkan dokumen XML yang valid dan terstruktur.'
  };
  const instruction = instructions[formatId] || 'Buatkan file yang sesuai dengan permintaan.';

  return `Tugas: ${task}

Instruksi: ${instruction}

Berikan SEMUA isi file secara lengkap, tanpa menyertakan teks pengantar atau penutup di luar konten file.`;
}
