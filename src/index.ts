import { runAgentLoop } from "./agentRunner";

//TODO: need to implement the tiktoken library to check token lengths, need to handle context windows and rate limits
(async () => {
    await runAgentLoop();
})();
