import { CustomFunctionTool } from "../agents/agent";
import { diffStrings } from "../service/diff";

export const diffStringsTool: CustomFunctionTool = {
    type: "function",
    name: "diffStrings",
    description: "Returns a unified diff of two strings. Optionally specify a file name for diff headers.",
    strict: true,
    parameters: {
        type: "object",
        properties: {
            oldStr: {
                type: "string",
                description: "The original string (file contents before)",
            },
            newStr: {
                type: "string",
                description: "The updated string (file contents after)",
            },
            fileName: {
                type: "string",
                description: "Optional file name for diff header (default is 'file')",
                default: "file",
            },
        },
        required: ["oldStr", "newStr"],
        additionalProperties: false,
    },
    functionToCall: async (oldStr: string, newStr: string, fileName: string = "file") => {
        return diffStrings(oldStr, newStr, fileName);
    },
};
