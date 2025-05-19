import { exec } from "child_process";
import path from "path";

/**
 * Runs the new-project.sh script in the current working directory.
 */
export function runNewProjectScript(): Promise<string> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, "../../scripts/new-project.sh");
        exec(`bash "${scriptPath}"`, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr || error.message}`);
            } else {
                resolve(stdout || "Project initialized successfully.");
            }
        });
    });
}
