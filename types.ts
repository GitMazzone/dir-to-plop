export interface FileInfo {
	path: string;
	name: string;
	isDirectory: boolean;
}

export interface PatternMatch {
	original: string;
	placeholder: string;
	pattern: 'pascalCase' | 'camelCase' | 'kebabCase' | 'snakeCase';
}

export interface ComponentInfo {
	name: string;
	variations: {
		pascal: string;
		camel: string;
		kebab: string;
		snake: string;
	};
}

export const STARTER_TEMPLATES = {
	ReactComponent: {
		name: 'React Component',
		path: './templates/ReactComponent',
	},
} as const;

export type TemplateType = keyof typeof STARTER_TEMPLATES;
