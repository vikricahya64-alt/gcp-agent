import { login } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email dan password diperlukan' }, { status: 400 });
    }

    const result = login(email, password);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 401 });
    }

    return Response.json({
      success: true,
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
