import OpenAI from "openai";
import { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import dotenv from "dotenv";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic"; // <--- Import Anthropic
import { mapMessagesToVercel, mapToolsToVercel } from "../agents/agent-utils";

// Load environment variables from .env file
dotenv.config();

// Initialize the OpenAI client with the API key from the .env file
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// export const createModelResponseRequest = async (
//     request: ResponseCreateParamsNonStreaming
// ) => {
//     const response = await client.responses.create(request);
//     return response;
// };

interface CustomAgentRequest {
    model: string;
    input: any[];
    instructions: string;
    tools: any[];
    [key: string]: any;
}

export const createModelResponseRequest = async (
    // We keep the signature you want, but strictly it's a custom object
    request: ResponseCreateParamsNonStreaming | CustomAgentRequest
) => {
    // Cast to our custom type to safely access 'input' and 'instructions'
    const agentRequest = request as CustomAgentRequest;

    // 1. SELECT PROVIDER
    // const modelProvider = agentRequest.model.startsWith("claude")
    //     ? anthropic(agentRequest.model)
    //     : openai(agentRequest.model);

    // 2. CONVERT DATA (Using your custom properties)
    const coreMessages = mapMessagesToVercel(agentRequest.input);
    const vercelTools = mapToolsToVercel(agentRequest.tools);

    // 3. CALL AI SDK
    const result = await generateText({
        model: "openai/gpt-5-nano",
        system: agentRequest.instructions, // Maps your 'instructions' to system prompt
        messages: coreMessages,
        tools: vercelTools,
        // maxSteps: 1, // Stop so your loop can handle execution
    });

    // 4. MAP RESPONSE (To match your { id, output } format)
    const output: any[] = [];

    // A) Handle Tool Calls
    if (result.toolCalls && result.toolCalls.length > 0) {
        for (const call of result.toolCalls) {
            output.push({
                type: "function_call",
                name: call.toolName,
                // IMPORTANT: Your agent loop does JSON.parse(args),
                // so we must JSON.stringify the object back to a string here.
                arguments: JSON.stringify((call as any).args),
                call_id: call.toolCallId,
            });
        }
    }
    // B) Handle Text
    else {
        output.push({
            role: "assistant",
            content: result.text,
            type: "message",
        });
    }

    // Return exact shape expected by runFunctionCallingAgent
    return {
        id: result.response.id ?? "gen-id",
        output: output,
    };
};
