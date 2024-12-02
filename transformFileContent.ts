import type { ComponentInfo } from './types.ts';

/**
 * Transforms a file's content by replacing all variations of the component name with Handlebars placeholders
 * @param sourceFilePath Path to the source file to transform
 * @param componentInfo Object containing the component name and its case variations
 * @returns Promise resolving to the transformed content as a string
 */
export async function transformFileContent(
	sourceFilePath: string,
	componentInfo: ComponentInfo
): Promise<string> {
	const content = await Deno.readTextFile(sourceFilePath);
	let transformedContent = content;

	const { variations } = componentInfo;
	transformedContent = transformedContent.replaceAll(
		variations.pascal,
		'{{pascalCaseName}}'
	);
	transformedContent = transformedContent.replaceAll(
		variations.camel,
		'{{camelCaseName}}'
	);
	transformedContent = transformedContent.replaceAll(
		variations.kebab,
		'{{kebabCaseName}}'
	);
	transformedContent = transformedContent.replaceAll(
		variations.snake,
		'{{snakeCaseName}}'
	);

	return transformedContent;
}
