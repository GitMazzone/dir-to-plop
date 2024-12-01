import type { FileInfo } from './types.ts';
import { join } from 'node:path';

/**
 * Recursively scans a directory and returns information about all files and subdirectories
 * @param dirPath The directory path to scan
 * @returns Promise resolving to an array of FileInfo objects containing path, name, and directory status
 */
export async function scanDirectory(dirPath: string): Promise<FileInfo[]> {
	const files: FileInfo[] = [];

	for await (const entry of Deno.readDir(dirPath)) {
		const fullPath = join(dirPath, entry.name);

		if (entry.isDirectory) {
			files.push({ path: fullPath, name: entry.name, isDirectory: true });
			files.push(...(await scanDirectory(fullPath)));
		} else {
			files.push({ path: fullPath, name: entry.name, isDirectory: false });
		}
	}

	return files;
}
