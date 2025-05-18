import {
    FunctionTool,
    ResponseCreateParamsNonStreaming,
    ResponseInput,
} from "openai/resources/responses/responses";
import { createModelResponseRequest } from "../client/openai";

export const expandPrompt = () => {};

export interface CustomFunctionTool extends FunctionTool {
    functionToCall: (...args: any[]) => any;
}

export class AgentService {
    #functionTools: Map<string, CustomFunctionTool> = new Map();

    addFunctionTool(functionTool: CustomFunctionTool) {
        this.#functionTools.set(functionTool.name, functionTool);
        return functionTool;
    }

    getFunctionToolDefinition(name: string) {
        const func = this.#functionTools.get(name);
        if (!func) {
            return undefined;
        }

        const { functionToCall, ...rest } = func;
        return rest;
    }

    getTool(name: string) {
        const tool = this.#functionTools.get(name);
        if (!tool) {
            return undefined;
        }

        return tool;
    }

    async runFunctionCallingAgent(
        prompt: string | ResponseInput,
        initalInstructions: string
    ) {
        const model = "gpt-4.1"; //"o4-mini",   //"gpt-4o" $2.50, o4-mini $1.10, gpt-4.1 $2.00

        let input: any[] = [];
        if (typeof prompt == "string") {
            input.push({ role: "user", content: prompt });
        } else {
            input = [...prompt];
        }

        const tools = Array.from(this.#functionTools.values()).map((func) => {
            const { functionToCall, ...rest } = func;
            return rest;
        });

        const request = {
            model: model,
            input,
            instructions: initalInstructions,
            previous_response_id: null,
            store: false, //Whether to store the generated model response for later retrieval via API. boolean | null;
            user: "me", //unique id that can identify end user
            //@ts-ignore
            tools,
        };

        try {
            const response = await createModelResponseRequest(request);

            let previousResponseId = response.id;
            let modelOutput = response.output;
            let hasFunctionCall = modelOutput.some(
                (obj) => obj.type === "function_call"
            );

            let followUpResponse;

            let iterations = 0;
            while (hasFunctionCall) {
                for (const action of modelOutput) {
                    if (action.type == "function_call") {
                        //@ts-ignore
                        const tool = this.getTool(action.name);

                        if (tool) {
                            console.log("running tool: " + tool.name);
                            //@ts-ignore
                            const params = tool?.parameters?.properties
                                ? Object.keys(tool.parameters.properties)
                                : [];

                            //@ts-ignore
                            const args: any[] = [];
                            //@ts-ignore
                            const actionArgs = JSON.parse(action.arguments);

                            for (const param of params) {
                                //@ts-ignore
                                args.push(actionArgs[param]);
                            }

                            let res = "";
                            try {
                                res = await tool.functionToCall(...args);
                            } catch (e) {
                                console.log(
                                    "Error running too " + tool.name + " " + e
                                );
                                res =
                                    "Error running too " + tool.name + " " + e;
                            }

                            input.push(action);
                            input.push({
                                // append result message
                                type: "function_call_output",
                                call_id: action.call_id,
                                output: JSON.stringify(res),
                            });
                        }
                    }
                }

                const functionResultsRequest = {
                    model: model,
                    input,
                    instructions: initalInstructions,
                    // previous_response_id: previousResponseId,
                    store: false, //Whether to store the generated model response for later retrieval via API. boolean | null;
                    user: "me", //unique id that can identify end user
                    tools,
                };

                console.log(`agent is on iteration ${iterations} `);

                followUpResponse = await createModelResponseRequest(
                    functionResultsRequest
                );

                modelOutput = followUpResponse.output;
                hasFunctionCall = modelOutput.some(
                    (obj) => obj.type === "function_call"
                );

                iterations++;
                if (iterations > 20) {
                    break;
                }
            }

            //TODO: do i want to be saving the whole conversation including all the function calls or do i just want the final result?
            const conversation = [...input, ...modelOutput];

            //TODO:do we need an intermidary step here where we can optionally process the results before sending back to gpt

            return conversation;
        } catch (e) {
            console.log("error in agent service: " + e);
            throw "error in agent service: " + e;
        }
    }
}

('[{"type":"directory","name":".git","path":".git","children":[{"type":"file","name":"COMMIT_EDITMSG","path":".git/COMMIT_EDITMSG","size":11},{"type":"file","name":"HEAD","path":".git/HEAD","size":23},{"type":"directory","name":"branches","path":".git/branches","children":[]},{"type":"file","name":"config","path":".git/config","size":92},{"type":"file","name":"description","path":".git/description","size":73},{"type":"directory","name":"hooks","path":".git/hooks","children":[{"type":"file","name":"applypatch-msg.sample","path":".git/hooks/applypatch-msg.sample","size":478},{"type":"file","name":"commit-msg.sample","path":".git/hooks/commit-msg.sample","size":896},{"type":"file","name":"fsmonitor-watchman.sample","path":".git/hooks/fsmonitor-watchman.sample","size":4655},{"type":"file","name":"post-update.sample","path":".git/hooks/post-update.sample","size":189},{"type":"file","name":"pre-applypatch.sample","path":".git/hooks/pre-applypatch.sample","size":424},{"type":"file","name":"pre-commit.sample","path":".git/hooks/pre-commit.sample","size":1643},{"type":"file","name":"pre-merge-commit.sample","path":".git/hooks/pre-merge-commit.sample","size":416},{"type":"file","name":"pre-push.sample","path":".git/hooks/pre-push.sample","size":1374},{"type":"file","name":"pre-rebase.sample","path":".git/hooks/pre-rebase.sample","size":4898},{"type":"file","name":"pre-receive.sample","path":".git/hooks/pre-receive.sample","size":544},{"type":"file","name":"prepare-commit-msg.sample","path":".git/hooks/prepare-commit-msg.sample","size":1492},{"type":"file","name":"push-to-checkout.sample","path":".git/hooks/push-to-checkout.sample","size":2783},{"type":"file","name":"update.sample","path":".git/hooks/update.sample","size":3650}]},{"type":"file","name":"index","path":".git/index","size":1490},{"type":"directory","name":"info","path":".git/info","children":[{"type":"file","name":"exclude","path":".git/info/exclude","size":240}]},{"type":"directory","name":"logs","path":".git/logs","children":[{"type":"file","name":"HEAD","path":".git/logs/HEAD","size":156},{"type":"directory","name":"refs","path":".git/logs/refs","children":[{"type":"directory","name":"heads","path":".git/logs/refs/heads","children":[{"type":"file","name":"master","path":".git/logs/refs/heads/master","size":156}]}]}]},{"type":"directory","name":"objects","path":".git/objects","children":[{"type":"directory","name":"04","path":".git/objects/04","children":[{"type":"file","name":"ccddfb5e67b1e4c61b8cc9419a4120ee7606fd","path":".git/objects/04/ccddfb5e67b1e4c61b8cc9419a4120ee7606fd","size":85}]},{"type":"directory","name":"06","path":".git/objects/06","children":[{"type":"file","name":"83dd23ce9894037f5643d09ba4754bc8b88a12","path":".git/objects/06/83dd23ce9894037f5643d09ba4754bc8b88a12","size":312}]},{"type":"directory","name":"09","path":".git/objects/09","children":[{"type":"file","name":"9f4979942722fcd2afa1907f7e1b958fac2691","path":".git/objects/09/9f4979942722fcd2afa1907f7e1b958fac2691","size":203}]},{"type":"directory","name":"0b","path":".git/objects/0b","children":[{"type":"file","name":"043114faf0d0c9e557db0d5226bb68f8a6cddd","path":".git/objects/0b/043114faf0d0c9e557db0d5226bb68f8a6cddd","size":285}]},{"type":"directory","name":"2e","path":".git/objects/2e","children":[{"type":"file","name":"25f44511b6e2643f5400946a4bea46a1bf7ed7","path":".git/objects/2e/25f44511b6e2643f5400946a4bea46a1bf7ed7","size":897}]},{"type":"directory","name":"37","path":".git/objects/37","children":[{"type":"file","name":"d83e188efc4d7e623fcee7c52dbbf864c8599d","path":".git/objects/37/d83e188efc4d7e623fcee7c52dbbf864c8599d","size":1099}]},{"type":"directory","name":"48","path":".git/objects/48","children":[{"type":"file","name":"d7bb29d1f3c18d4202ef33e56082489820beda","path":".git/objects/48/d7bb29d1f3c18d4202ef33e56082489820beda","size":36},{"type":"file","name":"ec7ba1f0e8d2d9b7b02088ddb28776c2d63bd8","path":".git/objects/48/ec7ba1f0e8d2d9b7b02088ddb28776c2d63bd8","size":1381},{"type":"file","name":"ee1ccef7e2cad7a0a36eaa11455567a1b7f3c4","path":".git/objects/48/ee1ccef7e2cad7a0a36eaa11455567a1b7f3c4","size":8778}]},{"type":"directory","name":"53","path":".git/objects/53","children":[{"type":"file","name":"e93481baff7e117f172b722920c31dc448f4cd","path":".git/objects/53/e93481baff7e117f172b722920c31dc448f4cd","size":1479}]},{"type":"directory","name":"5a","path":".git/objects/5a","children":[{"type":"file","name":"938ce18e9d5d282c238480902d5e4f6de562a2","path":".git/objects/5a/938ce18e9d5d282c238480902d5e4f6de562a2","size":52}]},{"type":"directory","name":"6e","path":".git/objects/6e","children":[{"type":"file","name":"ac676a3a59a34b9145facb111f36f75eeb5b36","path":".git/objects/6e/ac676a3a59a34b9145facb111f36f75eeb5b36","size":53}]},{"type":"directory","name":"84","path":".git/objects/84","children":[{"type":"file","name":"ccb8767224ca201ce8f05644163c1593932956","path":".git/objects/84/ccb8767224ca201ce8f05644163c1593932956","size":59}]},{"type":"directory","name":"88","path":".git/objects/88","children":[{"type":"file","name":"052a5f165b0c1e39cfa26be2a143e19a0f7e15","path":".git/objects/88/052a5f165b0c1e39cfa26be2a143e19a0f7e15","size":252}]},{"type":"directory","name":"90","path":".git/objects/90","children":[{"type":"file","name":"4d43ff28f75eabeb45bdd7b03c4e685059965e","path":".git/objects/90/4d43ff28f75eabeb45bdd7b03c4e685059965e","size":4272}]},{"type":"directory","name":"ae","path":".git/objects/ae","children":[{"type":"file","name":"50ba29ed0930ab0290f62ab5fc1896c01dca31","path":".git/objects/ae/50ba29ed0930ab0290f62ab5fc1896c01dca31","size":1621}]},{"type":"directory","name":"cc","path":".git/objects/cc","children":[{"type":"file","name":"6459134820d3eb91e3dc9d3d9fd141f6557796","path":".git/objects/cc/6459134820d3eb91e3dc9d3d9fd141f6557796","size":54}]},{"type":"directory","name":"cd","path":".git/objects/cd","children":[{"type":"file","name":"40c631bbc5a34160857a1762155ed178b8958e","path":".git/objects/cd/40c631bbc5a34160857a1762155ed178b8958e","size":126}]},{"type":"directory","name":"d2","path":".git/objects/d2","children":[{"type":"file","name":"b9e0e7ae9f44938ea2b139d6d3e1ea5079a543","path":".git/objects/d2/b9e0e7ae9f44938ea2b139d6d3e1ea5079a543","size":227}]},{"type":"directory","name":"d8","path":".git/objects/d8","children":[{"type":"file","name":"52604595370315a1aa0892b8b62cc8b8e5d4a8","path":".git/objects/d8/52604595370315a1aa0892b8b62cc8b8e5d4a8","size":349}]},{"type":"directory","name":"d9","path":".git/objects/d9","children":[{"type":"file","name":"9ea7f74756268b03632600ed523bc01d7a8fa2","path":".git/objects/d9/9ea7f74756268b03632600ed523bc01d7a8fa2","size":87}]},{"type":"directory","name":"db","path":".git/objects/db","children":[{"type":"file","name":"13d282437942b8f36697775a12ee5c0c8f6916","path":".git/objects/db/13d282437942b8f36697775a12ee5c0c8f6916","size":454}]},{"type":"directory","name":"e6","path":".git/objects/e6","children":[{"type":"file","name":"9de29bb2d1d6434b8b29ae775ad8c2e48c5391","path":".git/objects/e6/9de29bb2d1d6434b8b29ae775ad8c2e48c5391","size":15}]},{"type":"directory","name":"info","path":".git/objects/info","children":[]},{"type":"directory","name":"pack","path":".git/objects/pack","children":[]}]},{"type":"directory","name":"refs","path":".git/refs","children":[{"type":"directory","name":"heads","path":".git/refs/heads","children":[{"type":"file","name":"master","path":".git/refs/heads/master","size":41}]},{"type":"directory","name":"tags","path":".git/refs/tags","children":[]}]}]},{"type":"file","name":".gitignore","path":".gitignore","size":26},{"type":"file","name":".prettierrc","path":".prettierrc","size":40},{"type":"directory","name":"dist","path":"dist","children":[]},{"type":"directory","name":"node_modules","path":"node_modules","children":[]},{"type":"file","name":"package.json","path":"package.json","size":484},{"type":"file","name":"readme.md","path":"readme.md","size":284},{"type":"directory","name":"scripts","path":"scripts","children":[{"type":"file","name":"add-scripts.js","path":"scripts/add-scripts.js","size":325}]},{"type":"directory","name":"src","path":"src","children":[{"type":"directory","name":"agents","path":"src/agents","children":[{"type":"file","name":"agent.ts","path":"src/agents/agent.ts","size":5756}]},{"type":"file","name":"cli.ts","path":"src/cli.ts","size":3396},{"type":"directory","name":"client","path":"src/client","children":[{"type":"file","name":"openai.ts","path":"src/client/openai.ts","size":540}]},{"type":"file","name":"index.ts","path":"src/index.ts","size":3469},{"type":"directory","name":"service","path":"src/service","children":[{"type":"file","name":"diff.ts","path":"src/service/diff.ts","size":622},{"type":"file","name":"filesystem.ts","path":"src/service/filesystem.ts","size":5121}]},{"type":"directory","name":"tools","path":"src/tools","children":[{"type":"file","name":"difftools.ts","path":"src/tools/difftools.ts","size":1156},{"type":"file","name":"filetools.ts","path":"src/tools/filetools.ts","size":3438}]}]},{"type":"file","name":"tsconfig.json","path":"tsconfig.json","size":249},{"type":"file","name":"yarn.lock","path":"yarn.lock","size":18597}]');
