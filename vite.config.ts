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
    UnoCSS({
      extractors: [extractorSvelte()],
    }),
    sveltekit(),
  ],
  define: {
    PKG: pkg,
  },
})
