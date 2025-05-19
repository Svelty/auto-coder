import { CustomFunctionTool } from "../agents/agent";
import { runNewProjectScript } from "../service/newProject";

export const runNewProjectTool: CustomFunctionTool = {
    type: "function",
    name: "runNewProjectScript",
    description: "Initializes a new project by running the scripts/new-project.sh script in the current directory.",
    strict: false,
    parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
    },
    functionToCall: async () => {
        return await runNewProjectScript();
    },
};
