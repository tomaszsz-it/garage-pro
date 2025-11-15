import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { z } from "zod";

export const prerender = false;

const forgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu e-mail"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Nieprawidłowe dane wejściowe",
            details: validationResult.error.issues,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { email } = validationResult.data;

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Forgot password error:", error);
    }

    // Always return success for security reasons (don't reveal if email exists)
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: "Jeśli podany adres e-mail istnieje w naszej bazie, wyślemy link do resetowania hasła",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Wystąpił błąd serwera",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
