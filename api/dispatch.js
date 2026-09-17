export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { actionType, prompt, sessionId } = req.body; // actionType: 'init' or 'ask'
  const workflowFile = actionType === 'init' ? 'init.yml' : 'ask.yml';

  const response = await fetch(
    `https://api.github.com/repos/saad-pie/ATRIA-HERMES/actions/workflows/${workflowFile}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`, // Personal Access Token
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { session_id: sessionId, prompt: prompt || '' },
      }),
    }
  );

  if (!response.ok) return res.status(500).json({ error: 'Failed to dispatch workflow' });
  return res.status(200).json({ status: 'Workflow dispatched successfully', sessionId });
}
