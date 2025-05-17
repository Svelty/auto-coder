import readline from "readline/promises";
import { AgentService } from "./agents/agent";
import {
    getProjectStructureTool,
    makeFileTool,
    readProjectFileTool,
    writeProjectFileTool,
} from "./tools/filetools";
import { ResponseInput } from "openai/resources/responses/responses";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const chatSessions: Map<number, ResponseInput> = new Map();

const sessionId = 1;

(async () => {
    process.on("SIGINT", () => {
        console.log("\nExiting...");
        rl.close();
        process.exit(0);
    });

    const agent = new AgentService();
    agent.addFunctionTool(makeFileTool);
    agent.addFunctionTool(getProjectStructureTool);
    agent.addFunctionTool(readProjectFileTool);
    agent.addFunctionTool(writeProjectFileTool);

    console.log(
        "Hi, welcome to your command line helper, what can I do for you today?"
    );

    while (true) {
        try {
            const currentSessionId = sessionId;

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

            const res = await agent.runFunctionCallingAgent(
                input,
                `You are a command line tool coding assistant, you work in a linux env. You can get the project structure with the getProjectStructure tool and read files with the readProjectFile tool. If you don't know the path of a file get the project structure first. You can edit files with the writeProjectFile tool, but always make sure you have read the file first.
                Please make sure you adhear to the following guidelines
                    ## PERSISTENCE
                    You are an agent - please keep going until the user's query is completely 
                    resolved, before ending your turn and yielding back to the user. Only 
                    terminate your turn when you are sure that the problem is solved.

                    ## TOOL CALLING
                    If you are not sure about file content or codebase structure pertaining to 
                    the user's request, use your tools to read files and gather the relevant 
                    information: do NOT guess or make up an answer.

                    ## PLANNING
                    You MUST plan extensively before each function call, and reflect 
                    extensively on the outcomes of the previous function calls. DO NOT do this 
                    entire process by making function calls only, as this can impair your 
                    ability to solve the problem and think insightfully.
                `
            );

            if (res.length) {
                const lastMessage = res[res.length - 1];
                console.log(lastMessage.content);
            } else {
                console.log("unexpected response from agent");
                console.log(res);
            }

            chatSessions.set(currentSessionId, res);
        } catch (e) {
            console.log("error running function caller");
            rl.close();
            break;
        }
    }
})();
