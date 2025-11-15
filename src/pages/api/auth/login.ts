import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { z } from 'zod';

export const prerender = false;

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format adresu e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Nieprawidłowe dane wejściowe',
            details: validationResult.error.issues,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);

      // More specific error messages
      let errorMessage = 'Nieprawidłowy adres e-mail lub hasło';
      if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Adres e-mail nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Nieprawidłowe dane logowania. Sprawdź email i hasło.';
      } else if (error.message?.includes('User not found')) {
        errorMessage = 'Użytkownik nie istnieje.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: errorMessage,
            supabaseError: error.message,
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Wystąpił błąd serwera',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
