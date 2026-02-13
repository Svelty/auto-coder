import { tool } from "ai";
import { z } from "zod";

// --- 1. Map JSON Schema to Zod (For Tools) ---
// We explicitly type the return to satisfy the tool() helper
function jsonSchemaToZod(schema: any): z.ZodTypeAny {
    if (!schema) return z.any();

    switch (schema.type) {
        case "string":
            return z.string().describe(schema.description || "");
        case "number":
        case "integer":
            return z.number().describe(schema.description || "");
        case "boolean":
            return z.boolean().describe(schema.description || "");
        case "object":
            const shape: Record<string, z.ZodTypeAny> = {};
            // Handle 'required' fields
            const required = new Set(
                Array.isArray(schema.required) ? schema.required : []
            );

            for (const [key, prop] of Object.entries(schema.properties || {})) {
                const s = jsonSchemaToZod(prop);
                // Apply optional() if the key is not in the required array
                shape[key] = required.has(key) ? s : s.optional();
            }
            return z.object(shape).describe(schema.description || "");
        default:
            // Fallback for arrays or unknown types
            return z.any().describe(schema.description || "");
    }
}

export function mapToolsToVercel(toolsList: any[]) {
    const tools: Record<string, any> = {};
    for (const t of toolsList) {
        // FIX: Cast the configuration object to 'any'.
        // This stops TypeScript from trying to match strict overloads
        // for 'parameters' and falling back to the wrong definition.
        tools[t.name] = tool({
            description: t.description,
            parameters: jsonSchemaToZod(t.parameters),
            // execute: async () => { return "dummy"; },//TODO: do i even need this?
        } as any);
    }
    return tools;
}

// export function mapMessagesToVercel(input: any[]) {
//     return input.map((msg, index, arr) => {
//         // 1. Standard User/System messages
//         if (msg.role === "user" || msg.role === "system") {
//             return {
//                 role: msg.role as "user" | "system",
//                 content: msg.content,
//             };
//         }

//         // 2. Assistant requesting a function call
//         if (msg.type === "function_call") {
//             return {
//                 role: "assistant" as const,
//                 content: [
//                     {
//                         type: "tool-call" as const,
//                         toolCallId: msg.call_id,
//                         toolName: msg.name,
//                         args:
//                             typeof msg.arguments === "string"
//                                 ? JSON.parse(msg.arguments)
//                                 : msg.arguments,
//                     },
//                 ],
//             };
//         }

//         // 3. The result of the function call
//         if (msg.type === "function_call_output") {
//             // FIX: We must find the tool name.
//             // In your loop, you push the 'action' (call) immediately before the 'output'.
//             // So we look at the previous message to find the name.
//             let toolName = "unknown_tool";
//             const prevMsg = arr[index - 1];

//             if (
//                 prevMsg &&
//                 prevMsg.type === "function_call" &&
//                 prevMsg.call_id === msg.call_id
//             ) {
//                 toolName = prevMsg.name;
//             }

//             return {
//                 role: "tool" as const,
//                 content: [
//                     {
//                         type: "tool-result" as const,
//                         toolCallId: msg.call_id,
//                         toolName: toolName, // <--- REQUIRED property added
//                         result: msg.output,
//                     },
//                 ],
//             };
//         }

//         // 4. Standard Assistant text response
//         return {
//             role: "assistant" as const,
//             content: msg.content || "",
//         };
//     });
// }

// utils.ts

export function mapMessagesToVercel(input: any[]) {
    return input.map((msg, index, arr) => {
        // 1. Standard User/System messages
        if (msg.role === "user" || msg.role === "system") {
            return {
                role: msg.role as "user" | "system",
                content: msg.content,
            };
        }

        // 2. Assistant requesting a function call
        if (msg.type === "function_call") {
            return {
                role: "assistant" as const,
                content: [
                    {
                        type: "tool-call" as const,
                        toolCallId: msg.call_id,
                        toolName: msg.name,
                        args:
                            typeof msg.arguments === "string"
                                ? JSON.parse(msg.arguments)
                                : msg.arguments,
                    },
                ],
            };
        }

        // 3. The result of the function call
        if (msg.type === "function_call_output") {
            // Find the tool name from the previous message
            let toolName = "unknown_tool";
            const prevMsg = arr[index - 1];

            if (
                prevMsg &&
                prevMsg.type === "function_call" &&
                prevMsg.call_id === msg.call_id
            ) {
                toolName = prevMsg.name;
            }

            return {
                role: "tool" as const,
                content: [
                    {
                        type: "tool-result" as const,
                        toolCallId: msg.call_id,
                        toolName: toolName,
                        // FIX: The error says 'output' is required.
                        // We provide both 'output' (for TS) and 'result' (for safety)
                        // and cast to any to bypass strict union mismatch.
                        output: msg.output,
                        result: msg.output,
                    } as any,
                ],
            };
        }

        // 4. Standard Assistant text response
        return {
            role: "assistant" as const,
            content: msg.content || "",
        };
    });
}
