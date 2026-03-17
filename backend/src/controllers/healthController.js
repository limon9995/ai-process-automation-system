export const healthController = {
  getHealth(_req, res) {
    res.json({ status: 'ok', service: 'AI Process Automation System API', time: new Date().toISOString() });
  }
};
