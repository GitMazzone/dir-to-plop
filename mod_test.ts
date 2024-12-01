import { assertEquals } from 'jsr:@std/assert';
import { join } from 'jsr:@std/path';
import { ensureDir } from 'jsr:@std/fs';
import { convertToTemplate } from './mod.ts';

// Helper function to clean up test directories
async function cleanup(path: string) {
	try {
		await Deno.remove(path, { recursive: true });
	} catch {
		// Ignore errors if directory doesn't exist
	}
}

Deno.test({
	name: 'convertToTemplate - creates output directory structure',
	async fn() {
		// Setup test directories
		const sourceDir = './test_source';
		const outputDir = './test_output';
		await cleanup(sourceDir);
		await cleanup(outputDir);

		// Create source structure with a PascalCase component file
		await ensureDir(join(sourceDir, 'subdir1/subdir2'));
		await Deno.writeTextFile(
			join(sourceDir, 'TestComponent.tsx'),
			'export const TestComponent = () => {};'
		);
		await Deno.writeTextFile(join(sourceDir, 'file1.ts'), 'content');
		await Deno.writeTextFile(join(sourceDir, 'subdir1/file2.ts'), 'content');
		await Deno.writeTextFile(
			join(sourceDir, 'subdir1/subdir2/file3.ts'),
			'content'
		);

		// Run conversion
		await convertToTemplate(sourceDir, outputDir);

		// Verify output structure exists
		const outputExists = async (path: string) => {
			try {
				await Deno.stat(path);
				return true;
			} catch {
				return false;
			}
		};

		assertEquals(
			await outputExists(outputDir),
			true,
			'Output dir should exist'
		);
		assertEquals(
			await outputExists(join(outputDir, 'subdir1')),
			true,
			'subdir1 should exist'
		);
		assertEquals(
			await outputExists(join(outputDir, 'subdir1/subdir2')),
			true,
			'subdir2 should exist'
		);

		// Verify output files with .hbs extension
		assertEquals(
			await outputExists(join(outputDir, '{{pascalCase name}}.tsx.hbs')),
			true,
			'Component template should exist'
		);

		// Cleanup
		await cleanup(sourceDir);
		await cleanup(outputDir);
	},
});
