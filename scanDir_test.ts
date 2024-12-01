import { assertEquals } from 'jsr:@std/assert';
import { ensureDir } from 'jsr:@std/fs';
import { join } from 'jsr:@std/path';
import { scanDirectory } from './scanDir.ts';

async function cleanup(path: string) {
	try {
		await Deno.remove(path, { recursive: true });
	} catch {
		// Ignore errors if directory doesn't exist
	}
}

Deno.test({
	name: 'scanDirectory - correctly identifies files and nested directories',
	async fn() {
		const testDir = './test_scan_dir';
		await cleanup(testDir);

		// Create test directory structure
		await ensureDir(join(testDir, 'subdir'));
		await Deno.writeTextFile(join(testDir, 'file1.ts'), 'content');
		await Deno.writeTextFile(join(testDir, 'subdir', 'file2.ts'), 'content');

		const files = await scanDirectory(testDir);

		// Sort files by path for consistent testing
		const sortedFiles = files.sort((a, b) => a.path.localeCompare(b.path));

		assertEquals(sortedFiles, [
			{
				path: join(testDir, 'file1.ts'),
				name: 'file1.ts',
				isDirectory: false,
			},
			{
				path: join(testDir, 'subdir'),
				name: 'subdir',
				isDirectory: true,
			},
			{
				path: join(testDir, 'subdir', 'file2.ts'),
				name: 'file2.ts',
				isDirectory: false,
			},
		]);

		await cleanup(testDir);
	},
});

Deno.test({
	name: 'scanDirectory - handles empty directories',
	async fn() {
		const testDir = './test_empty_dir';
		await cleanup(testDir);
		await ensureDir(testDir);

		const files = await scanDirectory(testDir);
		assertEquals(files, []);

		await cleanup(testDir);
	},
});
