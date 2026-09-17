import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { session_id } = req.query;
  const logs = (await kv.get(`logs:${session_id}`)) || [];
  return res.status(200).json({ logs });
}
