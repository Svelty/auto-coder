import { CustomFunctionTool } from "../agents/agent";
import {
    createDirsAndFile,
    createFileOnly,
    readDirRecursive,
    readProjectFile,
    writeProjectFile,
} from "../service/filesystem";

export const makeFileTool: CustomFunctionTool = {
    type: "function",
    name: "createFile",
    description:
        "makes a new file on the host filesystem. If requested can pass a boolean to create all directories but should default to only creating the file",
    strict: true,
    parameters: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "the name of the file and the file path to create",
            },
            createDirectories: {
                type: "boolean",
                description:
                    "If true, create all the directories in the filepath, if false create only the file. Default to false unless explicitly requested to create directories",
            },
        },
        required: ["filePath", "createDirectories"],
        additionalProperties: false,
    },
    functionToCall: async (filePath: string, createDirectories: string) => {
        return createDirectories
            ? createDirsAndFile(filePath)
            : createFileOnly(filePath);
    },
};

export const getProjectStructureTool: CustomFunctionTool = {
    type: "function",
    name: "getProjectStructure",
    description:
        "gets the structure of files and directories from a given project directory. Defualt to '.' to get the full structure of this project",
    strict: false,
    parameters: {
        type: "object",
        properties: {
            projectRoot: {
                type: "string",
                description:
                    "the name of the directory to starting reading from. Default to '.'",
            },
        },
        required: ["projectRoot"],
        additionalProperties: false,
    },
    functionToCall: async (projectRoot: string) => {
        return readDirRecursive(projectRoot);
    },
};

export const readProjectFileTool: CustomFunctionTool = {
    type: "function",
    name: "readProjectFile",
    description: "reads a file from the project",
    strict: false,
    parameters: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "the name of the file to read",
            },
        },
        required: ["filePath"],
        additionalProperties: false,
    },
    functionToCall: async (filePath: string) => {
        return readProjectFile(filePath);
    },
};

export const writeProjectFileTool: CustomFunctionTool = {
    type: "function",
    name: "writeProjectFile",
    description:
        "write to a file in the project. Always make sure you have read the file before writing to it.",
    strict: false,
    parameters: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "the name of the file to read",
            },
            content: {
                type: "string",
                description: "the content that will be written to the file",
            },
        },
        required: ["filePath", "content"],
        additionalProperties: false,
    },
    functionToCall: async (filePath: string, content: string) => {
        return writeProjectFile(filePath, content);
    },
};
