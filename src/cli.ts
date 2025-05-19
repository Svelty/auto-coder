#!/usr/bin/env node
import readline from "readline/promises";
import { AgentService } from "./agents/agent";
import {
    getProjectStructureTool,
    makeFileTool,
    readProjectFileTool,
    writeProjectFileTool,
} from "./tools/filetools";
import { diffStringsTool } from "./tools/difftools";
import { ResponseInput } from "openai/resources/responses/responses";
import { runAgentLoop } from "./agentRunner";

(async () => {
    await runAgentLoop();
})();
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// const chatSessions: Map<number, ResponseInput> = new Map();
// // future: allow multiple sessions, for now just 1
// const sessionId = 1;

// (async () => {
//     process.on("SIGINT", () => {
//         console.log("\nExiting...");
//         rl.close();
//         process.exit(0);
//     });

//     // Register all available tools (file and diff tools)
//     const agent = new AgentService();
//     agent.addFunctionTool(makeFileTool);
//     agent.addFunctionTool(getProjectStructureTool);
//     agent.addFunctionTool(readProjectFileTool);
//     agent.addFunctionTool(writeProjectFileTool);
//     agent.addFunctionTool(diffStringsTool);

//     console.log(
//         "Hi, welcome to your command line helper (CLI Edition), what can I do for you today?"
//     );

//     while (true) {
//         try {
//             const currentSessionId = sessionId;

//             const userInput = await rl.question("");
//             if (userInput.trim().toLowerCase() === "exit") {
//                 rl.close();
//                 break;
//             }

//             let input: ResponseInput = [];
//             if (chatSessions.has(currentSessionId)) {
//                 input = [...chatSessions.get(currentSessionId)!];
//             }
//             input.push({ role: "user", content: userInput });

//             console.log("----sending user input to agent----");

//             const res = await agent.runFunctionCallingAgent(
//                 input,
//                 `You are a command line tool coding assistant, you work in a linux env. You can work on any project directory (not just the default). You can get the structure of files and directories, read or write files, and perform diffs. Always make sure you have read the file before writing to it. Use the tools provided to you for any filesystem operation.\nPlease make sure you adhere to the following guidelines\n  ## PERSISTENCE\n  You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.\n  ## TOOL CALLING\n  If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather information: do NOT guess or make up an answer.\n  ## PLANNING\n  You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.`
//             );

//             if (res.length) {
//                 const lastMessage = res[res.length - 1];
//                 console.log(lastMessage.content);
//             } else {
//                 console.log("unexpected response from agent");
//                 console.log(res);
//             }

//             chatSessions.set(currentSessionId, res);
//         } catch (e) {
//             console.log("error running function caller");
//             rl.close();
//             break;
//         }
//     }
// })();
