import { orchestrator } from '@/lib/orchestrator';
import { insertTask, updateTaskStatus, insertWorkflow, updateWorkflowStatus } from '@/lib/database';
import { callGemini } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { task, userId } = await request.json();

    if (!task) {
      return Response.json({ error: 'Task description diperlukan' }, { status: 400 });
    }

    const result = await orchestrator.orchestrate(task, userId);

    let taskId = null;
    if (userId) {
      const taskResult = insertTask(userId, task, task, result.category, result.model);
      taskId = taskResult.lastInsertRowid;

      for (const step of result.workflow.steps) {
        insertWorkflow(taskId, step.name);
      }
    }

    let aiResponse = null;
    if (result.category === 'code') {
      aiResponse = await callGemini(`Buatkan kode untuk: ${task}`);
    } else if (result.category === 'analysis') {
      aiResponse = await callGemini(`Analisis: ${task}`);
    } else if (result.category === 'content') {
      aiResponse = await callGemini(`Buatkan konten: ${task}`);
    } else {
      aiResponse = await callGemini(`Proses task: ${task}`);
    }

    if (taskId) {
      updateTaskStatus(taskId, 'completed', aiResponse?.response || 'Selesai');
    }

    return Response.json({
      success: true,
      data: {
        ...result,
        aiResponse: aiResponse?.response || 'Response placeholder',
        taskId
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: 'GCP Agent Orchestration API',
    usage: 'POST ke /api/orchestrate dengan body { "task": "deskripsi task" }',
    categories: ['code', 'analysis', 'content', 'design', 'automation', 'research', 'devops', 'business']
  });
}
