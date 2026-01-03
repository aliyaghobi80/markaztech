// Central toggle for WebSocket usage. Keep false on shared hosting (cPanel).
export const WS_ENABLED = process.env.NEXT_PUBLIC_WS_ENABLED === 'true';
