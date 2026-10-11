import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'

import { defineConfig } from 'vite'

import extractorSvelte from '@unocss/extractor-svelte'
import UnoCSS from 'unocss/vite'

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const file = fileURLToPath(new URL('package.json', import.meta.url))
const json = readFileSync(file, 'utf8')
const pkg = JSON.parse(json)

export default defineConfig({
  plugins: [
    // SvelteKit has no index.html; CSS comes from `virtual:uno.css`, so drop Uno's unused HTML hook
    UnoCSS({
      extractors: [extractorSvelte()],
    }).map((plugin) => ({ ...plugin, transformIndexHtml: undefined })),
    sveltekit({
      adapter: adapter({
        fallback: 'index.html',
      }),
      paths: {
        base: process.argv.includes('dev') ? '' : (process.env.PUBLIC_BASE_PATH as `/${string}` | undefined),
      },
    }),
  ],
  define: {
    PKG: pkg,
  },
})
