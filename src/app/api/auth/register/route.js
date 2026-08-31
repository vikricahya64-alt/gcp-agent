import { register } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return Response.json({ error: 'Username, email, dan password diperlukan' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const result = register(username, email, password);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true, userId: result.userId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
