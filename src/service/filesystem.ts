import fs from "fs/promises";
import ignore from "ignore";
import path from "path";

export type FileNode = {
    type: "file";
    name: string;
    path: string;
    size: number;
};

export type DirectoryNode = {
    type: "directory";
    name: string;
    path: string;
    children: TreeNode[];
};

export type TreeNode = FileNode | DirectoryNode;

export const readDirRecursive = async (
    dir: string,
    base: string = dir,
    ignoreDirs: string[] = ["node_modules", ".git"]
): Promise<TreeNode[]> => {
    // Load and parse .gitignore only at the top-level call
    let ig: ReturnType<typeof ignore> | null = null;
    if (base === dir) {
        try {
            const gitignorePath = path.join(process.cwd(), ".gitignore");
            const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
            ig = ignore().add(gitignoreContent);
        } catch (err) {
            ig = ignore(); // fallback to no ignores if not found
        }
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });
    const result: TreeNode[] = [];

    // Pass along the ignore instance through recursion
    async function processEntry(entry: any, ig: any): Promise<void> {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(base, fullPath);

        // Check if .gitignore ignores this path
        if (ig && ig.ignores(relativePath + (entry.isDirectory() ? "/" : ""))) {
            // If it's a directory, include node but do not recurse
            if (entry.isDirectory()) {
                result.push({
                    type: "directory",
                    name: entry.name,
                    path: relativePath,
                    children: [],
                });
            }
            // If it's an ignored file, skip it entirely
            return;
        }

        if (entry.isDirectory()) {
            // Support legacy explicit ignoreDirs for hardcoded patterns
            if (ignoreDirs && ignoreDirs.includes(entry.name)) {
                result.push({
                    type: "directory",
                    name: entry.name,
                    path: relativePath,
                    children: [],
                });
                return;
            }
            // Not ignored: recurse
            result.push({
                type: "directory",
                name: entry.name,
                path: relativePath,
                children: await readDirRecursive(fullPath, base, ignoreDirs),
            });
        } else {
            // Not ignored: push file
            const stats = await fs.stat(fullPath);
            result.push({
                type: "file",
                name: entry.name,
                path: relativePath,
                size: stats.size,
            });
        }
    }

    // Recursively process entries
    for (const entry of entries) {
        await processEntry(entry, ig);
    }
    return result;
};

export const createFileOnly = async (filePath: string) => {
    try {
        const fd = await fs.open(filePath, "wx");
        await fd.close();
        return "success";
    } catch (err) {
        console.error("Error:", err);
        return "failed to create file: " + err;
    }
};

export const createDirsAndFile = async (filePath: string) => {
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const fd = await fs.open(filePath, "wx");
        await fd.close();
        return "success";
    } catch (err) {
        console.error("Error:", err);
        return "failed to create file: " + err;
    }
};

export const readProjectFile = async (
    filePath: string
): Promise<string | null> => {
    //this only works for this project
    //will need to come up with a generic way to find the project root and check git ignore files
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(projectRoot)) {
        throw new Error("Access denied: file is outside the project root.");
    }

    const gitignorePath = path.join(projectRoot, ".gitignore");
    const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
    const ig = ignore().add(gitignoreContent);

    const relativePath = path.relative(projectRoot, resolvedPath);
    if (ig.ignores(relativePath)) return null;

    return await fs.readFile(resolvedPath, "utf8");
};

export const writeProjectFile = async (
    filePath: string,
    content: string
): Promise<boolean> => {
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(projectRoot)) {
        throw new Error("Access denied: file is outside the project root.");
    }

    const gitignorePath = path.join(projectRoot, ".gitignore");
    const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
    const ig = ignore().add(gitignoreContent);

    const relativePath = path.relative(projectRoot, resolvedPath);
    if (ig.ignores(relativePath)) return false;

    await fs.writeFile(resolvedPath, content, "utf8");
    return true;
};
