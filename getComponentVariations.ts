import type { ComponentInfo } from './types.ts';

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
