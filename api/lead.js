import { handleLeadRequest } from "../server/lead-handler.js";

export default async function handler(req, res) {
  const response = await handleLeadRequest({
    method: req.method,
    headers: req.headers,
    body: req.body,
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || ""
  });

  Object.entries(response.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  res.status(response.status).send(response.body);
}
