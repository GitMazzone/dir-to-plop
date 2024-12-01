import { ensureDir } from 'https://deno.land/std@0.224.0/fs/ensure_dir.ts';
import { parseArgs } from 'https://deno.land/std@0.224.0/cli/mod.ts';
import {
	dirname,
	join,
	relative,
} from 'https://deno.land/std@0.224.0/path/mod.ts';
import { scanDirectory } from './scanDir.ts';
import { transformFileContent } from './transformFileContent.ts';
import { getComponentVariations } from './getComponentVariations.ts';

export async function convertToTemplate(
	sourcePath: string,
	outputPath: string
) {
	try {
		const sourceInfo = await Deno.stat(sourcePath);
		if (!sourceInfo.isDirectory) {
			throw new Error('Source path must be a directory');
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error('Source path must be a directory');
		}
		throw error;
	}

	// Create output directory if it doesn't exist
	await ensureDir(outputPath);

	// Scan the directory
	const files = await scanDirectory(sourcePath);

	// Find the main component name (look for PascalCase file)
	const mainComponentFile = files.find((file) =>
		/^[A-Z][a-zA-Z0-9]*\.(tsx?|jsx?)$/.test(file.name)
	);

	if (!mainComponentFile) {
		throw new Error(
			'Could not find main component file (should be PascalCase)'
		);
	}

	const componentName = mainComponentFile.name.split('.')[0];
	const componentInfo = getComponentVariations(componentName);

	// Process each file
	for (const file of files) {
		if (file.isDirectory) {
			const relativePath = relative(sourcePath, file.path);
			await ensureDir(join(outputPath, relativePath));
			continue;
		}

		// Transform content using the main component info
		const transformedContent = await transformFileContent(
			file.path,
			componentInfo
		);

		// Transform filename using the appropriate pattern from componentInfo
		let newFileName = file.name;
		if (newFileName.includes(componentInfo.variations.pascal)) {
			newFileName = newFileName.replace(
				componentInfo.variations.pascal,
				'{{pascalCase name}}'
			);
		} else if (newFileName.includes(componentInfo.variations.camel)) {
			newFileName = newFileName.replace(
				componentInfo.variations.camel,
				'{{camelCase name}}'
			);
		} else if (newFileName.includes(componentInfo.variations.kebab)) {
			newFileName = newFileName.replace(
				componentInfo.variations.kebab,
				'{{kebabCase name}}'
			);
		} else if (newFileName.includes(componentInfo.variations.snake)) {
			newFileName = newFileName.replace(
				componentInfo.variations.snake,
				'{{snakeCase name}}'
			);
		}
		newFileName += '.hbs';

		// Create output file
		const relativePath = relative(sourcePath, file.path);
		const outputFilePath = join(outputPath, relativePath);
		const outputFileDir = dirname(outputFilePath);

		await ensureDir(outputFileDir);
		await Deno.writeTextFile(
			join(outputFileDir, newFileName),
			transformedContent
		);
	}
}

if (import.meta.main) {
	const args = parseArgs(Deno.args);
	const [sourcePath, outputPath] = args._;

	if (!sourcePath || !outputPath) {
		console.log('Usage: dtp <source-directory> <output-directory>');
		Deno.exit(1);
	}

	try {
		await convertToTemplate(String(sourcePath), String(outputPath));
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error('An unknown error occurred');
		}
		Deno.exit(1);
	}
}
