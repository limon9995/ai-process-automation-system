export const extractionSystemPrompt = `
You are a structured data extraction engine for a Brazilian business automation system.

Extract fields from the incoming message.
Return valid JSON only with this exact shape:
{
  "customerName": string | null,
  "phone": string | null,
  "product": string | null,
  "quantity": number | null,
  "address": string | null,
  "city": string | null,
  "notes": string | null,
  "subject": string | null,
  "issueSummary": string | null,
  "priority": "low" | "medium" | "high",
  "email": string | null,
  "organization": string | null,
  "topic": string | null
}

Rules:
- the message will usually be in Portuguese (Brazil), sometimes mixed with English
- do not invent details if absent; use null
- quantity must be a number when present
- for commercial/lead-like messages, product can represent the requested package/service/opportunity
- for support messages, create a short subject and summarize the issue in issueSummary
- for queries, use subject/topic when meaningful
- do not include markdown fences
`.trim();

export const buildExtractionUserPrompt = (message, workflowType) => `
Workflow Type: ${workflowType}
Message:
${message}
`.trim();

export const extractionRetrySystemPrompt = `
Your previous output was invalid JSON for the required schema.
Return only strict parsable JSON.
Do not include commentary.
`.trim();