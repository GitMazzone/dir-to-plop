import { join, relative, dirname } from 'node:path';
import { mkdir, stat, writeFile, cp } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { scanDirectory } from './scanDir.ts';
import { transformFileContent } from './transformFileContent.ts';
import { getComponentVariations } from './getComponentVariations.ts';
import process from 'node:process';
import { STARTER_TEMPLATES, type TemplateType } from './types.ts';

/**
 * Prompts user to select a starter template using a CLI menu
 * @returns Promise resolving to selected template type
 * @throws Error if stdin/stdout interaction fails
 */
async function promptForTemplate(): Promise<TemplateType> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	try {
		const templates = Object.entries(STARTER_TEMPLATES);
		console.log('======= SELECT A TEMPLATE =======');
		templates.forEach(([_key, { name }], index) => {
			console.log(`${index + 1}) ${name}`);
		});

		const input = await rl.question(
			'Enter the number of the template you want to generate: '
		);
		return templates[parseInt(input.trim() || '1', 10) - 1][0] as TemplateType;
	} finally {
		rl.close();
	}
}

/**
 * Creates a new project from a starter template
 * @param outputPath Path where the template should be created
 * @param templateType Optional template type. If not provided, user will be prompted
 */
async function createStarterTemplate(
	outputPath: string,
	templateType?: TemplateType
): Promise<void> {
	const template = templateType || (await promptForTemplate());
	const templatePath = STARTER_TEMPLATES[template].path;

	try {
		await stat(templatePath);
		await mkdir(outputPath, { recursive: true });
		await cp(templatePath, outputPath, { recursive: true });
		console.log(`Created ${template} template in ${outputPath}`);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to create template: ${error.message}`);
		}
		throw error;
	}
}

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
				'{{pascalCaseName}}'
			);
		} else if (newFileName.includes(componentInfo.variations.camel)) {
			newFileName = newFileName.replace(
				componentInfo.variations.camel,
				'{{camelCaseName}}'
			);
		} else if (newFileName.includes(componentInfo.variations.kebab)) {
			newFileName = newFileName.replace(
				componentInfo.variations.kebab,
				'{{kebabCaseName}}'
			);
		} else if (newFileName.includes(componentInfo.variations.snake)) {
			newFileName = newFileName.replace(
				componentInfo.variations.snake,
				'{{snakeCaseName}}'
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

	if (!args.length) {
		console.log('Usage: dir-to-plop <source-directory> <output-directory>');
		console.log('   or: dir-to-plop --starter <output-directory>');
		console.log(
			'   or: dir-to-plop --starter-react-component <output-directory>'
		);
		process.exit(1);
	}

	try {
		if (args[0] === '--starter') {
			if (!args[1]) {
				console.error('Error: Output directory is required');
				process.exit(1);
			}
			await createStarterTemplate(args[1]);
		} else if (args[0] === '--starter-react-component') {
			if (!args[1]) {
				console.error('Error: Output directory is required');
				process.exit(1);
			}
			await createStarterTemplate(args[1], 'ReactComponent');
		} else if (args[0] && args[1]) {
			await convertToTemplate(args[0], args[1]);
		} else {
			console.error('Error: Invalid arguments');
			process.exit(1);
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error('An unknown error occurred');
		}
		process.exit(1);
	}
}
