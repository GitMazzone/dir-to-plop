# dir-to-plop

Convert any directory into a Plop template. Perfect for when you have a component, hook, or utility that you want to turn into a reusable template.

## Installation

```bash
# Install globally
deno install --allow-read --allow-write jsr:@gitmazzone/dir-to-plop@0.1.0

# Or run directly
deno run --allow-read --allow-write jsr:@gitmazzone/dir-to-plop@0.1.0 ./source ./output
```

## Usage

```bash
# Convert existing component to template
dir-to-plop ./components/MyAwesomeComponent ./plop/templates/awesome-component

# Generate from starter template (interactive)
dir-to-plop --starter ./plop/templates/new-component

# Generate React component template directly
dir-to-plop --starter-react-component ./plop/templates/new-component
```

### Example

Given this source component:

```bash
MyAwesomeComponent/
├── MyAwesomeComponent.tsx
├── useMyAwesomeComponent.hook.ts
├── my-awesome-component.module.css
└── my_awesome_component_utils.ts
```

With contents like:

```tsx
// MyAwesomeComponent.tsx
export const MyAwesomeComponent = () => {
	const { data } = useMyAwesomeComponent();
	return <div className='my-awesome-component'>{data}</div>;
};
```

Running `dir-to-plop` will create:

```bash
awesome-component/
├── {{pascalCaseName}}.tsx.hbs
├── use{{pascalCaseName}}.hook.ts.hbs
├── {{kebabCaseName}}.module.css.hbs
└── {{snakeCaseName}}_utils.ts.hbs
```

With transformed contents:

```tsx
// {{pascalCaseName}}.tsx.hbs
export const {{pascalCaseName}} = () => {
  const { data } = use{{pascalCaseName}}();
  return <div className="{{kebabCaseName}}">{data}</div>;
};
```

## Current Features

- ✅ Converts directories into Plop templates
- ✅ Detects and transforms different naming patterns:
  - PascalCase (MyComponent)
  - camelCase (myComponent)
  - kebab-case (my-component)
  - snake_case (my_component)
- ✅ Maintains directory structure
- ✅ Adds .hbs extension to all files
- ✅ Provides an opinionated React Component starter template

## Limitations & TODOs

Current limitations:

- Does not generate Plop configuration files - you'll need to manually set up your plopfile.js
- Does not automatically configure Plop helpers (like pascalCase, camelCase)
- Only handles basic naming patterns - complex or nested component names might need manual adjustment
- Only processes text files - binary files are copied as-is

## Setting up Plop

After generating templates, you'll need to:

1. Install Plop in your project
2. Create a plopfile.js
3. Configure the required helpers

Basic plopfile.js example:

```javascript
export default function (plop) {
	plop.setHelper('pascalCase', (text) => {
		// Example telling plop how to transform pascalCase in templates
		return text
			.split(/[-_\s]+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
	});

	plop.setGenerator('component', {
		description: 'Create a new component',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Component name?',
			},
		],
		actions: [
			{
				type: 'addMany',
				destination: './src/components/{{kebabCaseName}}',
				templateFiles: 'plop/templates/component/**',
				base: 'plop/templates/component',
			},
		],
	});
}
```

## Contributing

Issues and PRs welcome!

## License

MIT
