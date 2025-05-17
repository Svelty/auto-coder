import OpenAI from "openai";
import { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize the OpenAI client with the API key from the .env file
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const createModelResponseRequest = async (
    request: ResponseCreateParamsNonStreaming
) => {
    const response = await client.responses.create(request);
    return response;
};
