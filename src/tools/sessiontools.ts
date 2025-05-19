import { CustomFunctionTool } from "../agents/agent";
import { getSessionId, setSessionId, listSessionIds, getChatSession } from "../sessionStore";

export const getSessionIdTool: CustomFunctionTool = {
    type: "function",
    name: "getSessionId",
    description: "Returns the current session id.",
    strict: false,
    parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
    },
    functionToCall: async () => {
        return getSessionId();
    },
};

export const setSessionIdTool: CustomFunctionTool = {
    type: "function",
    name: "setSessionId",
    description: "Updates the current session id.",
    strict: true,
    parameters: {
        type: "object",
        properties: {
            newId: {
                type: "number",
                description: "The new session id to set.",
            },
        },
        required: ["newId"],
        additionalProperties: false,
    },
    functionToCall: async ({ newId }: { newId: number }) => {
        setSessionId(newId);
        return { sessionId: getSessionId() };
    },
};

export const listSessionIdsTool: CustomFunctionTool = {
    type: "function",
    name: "listSessionIds",
    description: "Returns a list of session ids present in the chatSessions map.",
    strict: false,
    parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
    },
    functionToCall: async () => {
        return listSessionIds();
    },
};

export const getChatSessionTool: CustomFunctionTool = {
    type: "function",
    name: "getChatSession",
    description: "Gets the whole chat session for the specified id.",
    strict: true,
    parameters: {
        type: "object",
        properties: {
            id: {
                type: "number",
                description: "The session id to retrieve the chat for.",
            },
        },
        required: ["id"],
        additionalProperties: false,
    },
    functionToCall: async ({ id }: { id: number }) => {
        return getChatSession(id);
    },
};
