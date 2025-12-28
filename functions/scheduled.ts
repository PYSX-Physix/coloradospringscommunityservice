interface Env {
  ADMIN_API_KEY: string;
}

export async function onRequest(context: { env: Env }) {
  const response = await fetch('https://coloradospringscommunityservice.pages.dev/api/admin/send-verification-reminders', {
    method: 'POST',
    headers: {
      'X-Admin-API-Key': context.env.ADMIN_API_KEY
    }
  });
  
  return new Response(await response.text());
}