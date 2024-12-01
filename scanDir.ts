import type { FileInfo } from './types.ts';
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts';

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
