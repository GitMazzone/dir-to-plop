import { join, relative, dirname } from 'node:path';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { scanDirectory } from './scanDir.ts';
import { transformFileContent } from './transformFileContent.ts';
import { getComponentVariations } from './getComponentVariations.ts';
import process from 'node:process';

/**
 * Converts a directory containing a component into a Plop template directory.
 * Looks for a PascalCase file as the main component and transforms all related files.
 * @param sourcePath Path to the source directory containing the component
 * @param outputPath Path where the template directory should be created
 * @throws Error if source path doesn't exist or no PascalCase component file is found
 */
export async function convertToTemplate(
	sourcePath: string,
	outputPath: string
) {
	try {
		const sourceInfo = await stat(sourcePath);
		if (!sourceInfo.isDirectory()) {
			throw new Error('Source path must be a directory');
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error('Source path must be a directory');
		}
		throw error;
	}

	// Create output directory if it doesn't exist
	await mkdir(outputPath, { recursive: true });

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
			await mkdir(join(outputPath, relativePath), { recursive: true });
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

		await mkdir(outputFileDir, { recursive: true });
		await writeFile(join(outputFileDir, newFileName), transformedContent);
	}
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const [sourcePath, outputPath] = args;

	if (!sourcePath || !outputPath) {
		console.log('Usage: dtp <source-directory> <output-directory>');
		process.exit(1);
	}

	try {
		await convertToTemplate(String(sourcePath), String(outputPath));
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error('An unknown error occurred');
		}
		process.exit(1);
	}
}
