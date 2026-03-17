import OpenAI from 'openai';
import { env } from '../config/env.js';
import { classificationSystemPrompt, buildClassificationUserPrompt } from '../prompts/classificationPrompt.js';
import { extractionSystemPrompt, extractionRetrySystemPrompt, buildExtractionUserPrompt } from '../prompts/extractionPrompt.js';
import { responseSystemPrompt, buildResponseUserPrompt } from '../prompts/responsePrompt.js';
import { safeJsonParse } from '../utils/json.js';
import { validateWithSchema, classificationSchema, extractionSchema, replySchema } from '../utils/validators.js';
import { heuristicClassification, heuristicExtraction, heuristicReply } from '../utils/heuristics.js';

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

const generateJson = async ({ systemPrompt, userPrompt, schema }) => {
  if (!env.enableAi || !client) {
    return { success: false, data: null, error: 'AI disabled or OPENAI_API_KEY not set.' };
  }

  try {
    const response = await client.chat.completions.create({
      model: env.openAiModel,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    const parsed = safeJsonParse(content);

    if (!parsed.success) {
      return { success: false, data: null, error: `JSON parse failed: ${parsed.error}` };
    }

    const validated = validateWithSchema(schema, parsed.data);
    if (!validated.success) {
      return { success: false, data: null, error: `Schema validation failed: ${validated.error}` };
    }

    return { success: true, data: validated.data, error: null };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
};

export const aiService = {
  async classifyMessage(message) {
    const result = await generateJson({
      systemPrompt: classificationSystemPrompt,
      userPrompt: buildClassificationUserPrompt(message),
      schema: classificationSchema
    });

    if (result.success) return { ...result, source: 'openai' };

    return {
      success: true,
      data: heuristicClassification(message),
      error: result.error,
      source: 'fallback'
    };
  },

  async extractData(message, workflowType) {
    const firstTry = await generateJson({
      systemPrompt: extractionSystemPrompt,
      userPrompt: buildExtractionUserPrompt(message, workflowType),
      schema: extractionSchema
    });

    if (firstTry.success) return { ...firstTry, source: 'openai', attempts: 1 };

    const retry = await generateJson({
      systemPrompt: `${extractionSystemPrompt}\n\n${extractionRetrySystemPrompt}`,
      userPrompt: buildExtractionUserPrompt(message, workflowType),
      schema: extractionSchema
    });

    if (retry.success) return { ...retry, source: 'openai-retry', attempts: 2, previousError: firstTry.error };

    return {
      success: true,
      data: heuristicExtraction(message, workflowType),
      error: retry.error || firstTry.error,
      source: 'fallback',
      attempts: 2
    };
  },

  async generateReply(workflowType, message, extractedData) {
    const result = await generateJson({
      systemPrompt: responseSystemPrompt,
      userPrompt: buildResponseUserPrompt({ workflowType, message, extractedData }),
      schema: replySchema
    });

    if (result.success) {
      return { success: true, data: result.data.reply, error: null, source: 'openai' };
    }

    return {
      success: true,
      data: heuristicReply(workflowType, extractedData),
      error: result.error,
      source: 'fallback'
    };
  }
};
