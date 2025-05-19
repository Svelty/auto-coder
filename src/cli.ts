#!/usr/bin/env node
import { runAgentLoop } from "./agentRunner";

(async () => {
    await runAgentLoop();
})();
