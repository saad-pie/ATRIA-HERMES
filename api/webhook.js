import { kv } from '@vercel/kv'; // Or use global standard cache / Redis

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { session_id, status, output, type } = req.body;

  // Push status update into session log queue
  const logs = (await kv.get(`logs:${session_id}`)) || [];
  logs.push({ status, output, type, timestamp: new Date().toISOString() });
  await kv.set(`logs:${session_id}`, logs);

  return res.status(200).json({ success: true });
}
