export async function GET() {
  return Response.json({
    publicKey: process.env.WEB_PUSH_PUBLIC_KEY || '',
    configured: Boolean(process.env.WEB_PUSH_PUBLIC_KEY),
  });
}
