import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			'$models/*': 'src/lib/models/*',
			'$components/*': 'src/lib/components/*',
			'$modals/*': 'src/lib/modals/*',
			'$stores/*': 'src/stores/*',
			'$services/*': 'src/services/*'
		}
	}
};

export default config;
