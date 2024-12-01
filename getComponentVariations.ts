import type { ComponentInfo } from './types.ts';

/**
 * Generates variations of a component name in different case styles
 * @param componentName The original component name (expected to be in PascalCase)
 * @returns An object containing the original name and its variations in pascal, camel, kebab, and snake case
 */
export function getComponentVariations(componentName: string): ComponentInfo {
	return {
		name: componentName,
		variations: {
			pascal: componentName,
			camel: componentName.charAt(0).toLowerCase() + componentName.slice(1),
			kebab: componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
			snake: componentName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
		},
	};
}
