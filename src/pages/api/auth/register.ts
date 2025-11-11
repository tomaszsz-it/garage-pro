import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { z } from 'zod';

export const prerender = false;

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy format adresu e-mail'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body);
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      let message = 'Wystąpił błąd podczas rejestracji';
      
      if (error.message.includes('already registered')) {
        message = 'Użytkownik o tym adresie e-mail już istnieje';
      } else if (error.message.includes('weak password')) {
        message = 'Hasło jest zbyt słabe';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
          message: 'Konto zostało utworzone pomyślnie',
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
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
