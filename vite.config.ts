import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
tserver: {
		port: 443,
		https: true
	},

	ssr: {
		noExternal: ['bits-ui']
	},
	resolve: {
		dedupe: ['bits-ui']
	}
});
