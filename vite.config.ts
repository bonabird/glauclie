import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const apiTarget = env.API_INTERNAL_URL || 'http://localhost:8080';

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: {
			proxy: {
				'/api': {
					target: apiTarget,
					changeOrigin: true
				}
			}
		}
	};
});
