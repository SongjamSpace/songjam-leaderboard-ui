import { detectBot, isVulnScan, buildPayload, sendDetectEvent } from '@munerate/bot-id';

const botIdConfig = {
  siteId: 'fl_pub_79f424101b14717d35b3e7637c009ef6',
  apiEndpoint: 'https://munerate-ingest-server.onrender.com/api/detect',
  siteTag: 'fl_pub_79f424101b14717d35b3e7637c009ef6',
};

// Edge middleware for any framework on platforms like Vercel, AWS Amplify,
// Netlify, or self-hosted. Return a Response to block, or nothing to pass through.
export default function middleware(request: Request, event: any) {
  const url = new URL(request.url);
  const bot = detectBot(request.headers.get('user-agent') || '');
  const blocked = isVulnScan(url.pathname);

  if (bot || blocked) {
    const payload = buildPayload(request, botIdConfig, url.pathname, blocked);
    const send = sendDetectEvent(botIdConfig, payload, botIdConfig.siteTag).catch(() => {});
    // keep the request alive past the response for the fire-and-forget send
    if (event?.waitUntil) event.waitUntil(send);
  }

  if (blocked) {
    return new Response(null, { status: 403 });
  }
  // returning nothing lets the request pass through normally
}

export const config = {
  // run on document requests, skip static assets
  matcher: ['/((?!assets|favicon\\.ico).*)'],
};