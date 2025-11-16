/* eslint-disable no-console */
import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Wystąpił błąd podczas wylogowywania",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: "Wylogowano pomyślnie",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
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
