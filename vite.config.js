import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		coverage: {
			reporter: ['text', 'json-summary', 'json', 'html'],
			lines: 80,
			branches: 80,
			functions: 80,
			statements: 80
		}
	}
};

export default config;
