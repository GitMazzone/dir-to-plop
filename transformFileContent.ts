import type { ComponentInfo } from './types.ts';

export async function transformFileContent(
	sourceFilePath: string,
	componentInfo: ComponentInfo
): Promise<string> {
	const content = await Deno.readTextFile(sourceFilePath);
	let transformedContent = content;

	// Replace all variations
	const { variations } = componentInfo;
	transformedContent = transformedContent.replaceAll(
		variations.pascal,
		'{{pascalCase name}}'
	);
	transformedContent = transformedContent.replaceAll(
		variations.camel,
		'{{camelCase name}}'
	);
	transformedContent = transformedContent.replaceAll(
		variations.kebab,
		'{{kebabCase name}}'
	);
	transformedContent = transformedContent.replaceAll(
		variations.snake,
		'{{snakeCase name}}'
	);

	return transformedContent;
}
