import { assertEquals } from 'jsr:@std/assert';
import { transformFileContent } from './transformFileContent.ts';
import type { ComponentInfo } from './types.ts';

Deno.test({
	name: 'transformFileContent - replaces all case variations in content',
	async fn() {
		const testContent = `
      import { Something } from './utils';
      
      export const MyComponent = () => {
        const myComponent = useMyComponent();
        return <div className="my-component">
          <span>{my_component}</span>
        </div>;
      };
      
      export default MyComponent;
    `;

		const testFile = './test_component.tsx';
		await Deno.writeTextFile(testFile, testContent);

		const componentInfo: ComponentInfo = {
			name: 'MyComponent',
			variations: {
				pascal: 'MyComponent',
				camel: 'myComponent',
				kebab: 'my-component',
				snake: 'my_component',
			},
		};

		const transformed = await transformFileContent(testFile, componentInfo);

		// Clean up
		await Deno.remove(testFile);

		// Verify transformations
		assertEquals(
			transformed.includes('export const {{pascalCase name}}'),
			true,
			'Should replace PascalCase'
		);
		assertEquals(
			transformed.includes('const {{camelCase name}}'),
			true,
			'Should replace camelCase'
		);
		assertEquals(
			transformed.includes('className="{{kebabCase name}}"'),
			true,
			'Should replace kebab-case'
		);
		assertEquals(
			transformed.includes('{{{snakeCase name}}}'),
			true,
			'Should replace snake_case'
		);
	},
});

Deno.test({
	name: 'transformFileContent - handles files with no matches',
	async fn() {
		const testContent = 'No component names here!';
		const testFile = './test_no_matches.ts';
		await Deno.writeTextFile(testFile, testContent);

		const componentInfo: ComponentInfo = {
			name: 'MyComponent',
			variations: {
				pascal: 'MyComponent',
				camel: 'myComponent',
				kebab: 'my-component',
				snake: 'my_component',
			},
		};

		const transformed = await transformFileContent(testFile, componentInfo);
		await Deno.remove(testFile);

		assertEquals(transformed, testContent, 'Content should remain unchanged');
	},
});
