import { assertEquals } from 'jsr:@std/assert';
import { getComponentVariations } from './getComponentVariations.ts';

Deno.test({
	name: 'getComponentVariations - generates all case variations correctly',
	fn() {
		const result = getComponentVariations('MyComponent');

		assertEquals(result, {
			name: 'MyComponent',
			variations: {
				pascal: 'MyComponent',
				camel: 'myComponent',
				kebab: 'my-component',
				snake: 'my_component',
			},
		});
	},
});

Deno.test({
	name: 'getComponentVariations - handles multiple capital letters',
	fn() {
		const result = getComponentVariations('MyUiComponent');

		assertEquals(result, {
			name: 'MyUiComponent',
			variations: {
				pascal: 'MyUiComponent',
				camel: 'myUiComponent',
				kebab: 'my-ui-component',
				snake: 'my_ui_component',
			},
		});
	},
});
