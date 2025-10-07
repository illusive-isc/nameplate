import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	base: '/nameplate/', // GitHub Pagesの場合
	build: {
		outDir: 'dist'
	}
})