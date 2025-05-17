// src/service/diff.ts
// Requires the 'diff' package. Install with: npm install diff
import { createPatch } from 'diff';

/**
 * Returns a unified diff of two strings, suitable for file content or textual comparisons.
 * @param oldStr The original string (e.g., file contents before)
 * @param newStr The updated string (e.g., file contents after)
 * @param fileName Optional filename to appear in diff headers
 * @returns The unified diff as a string
 */
export const diffStrings = (
  oldStr: string,
  newStr: string,
  fileName = 'file'
): string => {
  return createPatch(fileName, oldStr, newStr, 'Old', 'New');
};
