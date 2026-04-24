import { handleLeadRequest } from "../../server/lead-handler.js";

export async function handler(event) {
  const response = await handleLeadRequest({
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    ip:
      event.headers["x-forwarded-for"] ||
      event.headers["client-ip"] ||
      event.headers["x-nf-client-connection-ip"] ||
      ""
  });

  return {
    statusCode: response.status,
    headers: response.headers,
    body: response.body
  };
}
