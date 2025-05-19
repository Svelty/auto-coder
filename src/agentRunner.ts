import readline from "readline/promises";
import { AgentService } from "./agents/agent";
import {
    getProjectStructureTool,
    makeFileTool,
    readProjectFileTool,
    writeProjectFileTool,
} from "./tools/filetools";
import { diffStringsTool } from "./tools/difftools";
import {
    getSessionIdTool,
    setSessionIdTool,
    listSessionIdsTool,
    getChatSessionTool,
} from "./tools/sessiontools";
import { runNewProjectTool } from "./tools/newprojecttools";
import { ResponseInput } from "openai/resources/responses/responses";
import {
  chatSessions,
  getSessionId,
  setSessionId,
  listSessionIds,
  getChatSession,
  setChatSession,
} from "./sessionStore";

/**
 * Runs the main agent CLI loop with all tools and shared session state.
 * Optionally accepts a greeting and system prompt.
 */
export async function runAgentLoop({
    greeting = "Hi, welcome to your command line helper, what can I do for you today?",
    systemPrompt = `You are a command line tool coding assistant, you work in a linux env. You can get the project structure with the getProjectStructure tool and read files with the readProjectFile tool. If you don't know the path of a file get the project structure first. You can edit files with the writeProjectFile tool, but always make sure you have read the file first.\nPlease make sure you adhear to the following guidelines\n    ## PERSISTENCE\n    You are an agent - please keep going until the user's query is completely        \n    resolved, before ending your turn and yielding back to the user. Only        \n    terminate your turn when you are sure that the problem is solved.\n    ## TOOL CALLING\n    If you are not sure about file content or codebase structure pertaining to        \n    the user's request, use your tools to read files and gather the relevant        \n    information: do NOT guess or make up an answer.\n    ## PLANNING\n    You MUST plan extensively before each function call, and reflect        \n    extensively on the outcomes of the previous function calls. DO NOT do this        \n    entire process by making function calls only, as this can impair your        \n    ability to solve the problem and think insightfully.`
}: {
    greeting?: string,
    systemPrompt?: string,
} = {}) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    process.on("SIGINT", () => {
        console.log("\nExiting...");
        rl.close();
        process.exit(0);
    });

    // Setup agent and tools
    const agent = new AgentService();
    agent.addFunctionTool(makeFileTool);
    agent.addFunctionTool(getProjectStructureTool);
    agent.addFunctionTool(readProjectFileTool);
    agent.addFunctionTool(writeProjectFileTool);
    agent.addFunctionTool(diffStringsTool);
    agent.addFunctionTool(getSessionIdTool);
    agent.addFunctionTool(setSessionIdTool);
    agent.addFunctionTool(listSessionIdsTool);
    agent.addFunctionTool(getChatSessionTool);
    agent.addFunctionTool(runNewProjectTool); // <-- Added new project tool

    console.log(greeting);

    while (true) {
        try {
            const currentSessionId = getSessionId();

            const userInput = await rl.question("");
            if (userInput.trim().toLowerCase() === "exit") {
                rl.close();
                break;
            }

            let input: ResponseInput = [];
            if (chatSessions.has(currentSessionId)) {
                input = [...chatSessions.get(currentSessionId)!];
            }
            input.push({ role: "user", content: userInput });

            console.log("----sending user input to agent----");

            const res = await agent.runFunctionCallingAgent(input, systemPrompt);

            if (res.length) {
                const lastMessage = res[res.length - 1];
                console.log(lastMessage.content);
            } else {
                console.log("unexpected response from agent");
                console.log(res);
            }

            setChatSession(currentSessionId, res);
        } catch (e) {
            console.log("error running function caller: " + e);
            rl.close();
            break;
        }
    }
}
