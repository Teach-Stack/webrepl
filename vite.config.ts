import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { defineConfig } from 'vite'

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const file = fileURLToPath(new URL('package.json', import.meta.url))
const json = readFileSync(file, 'utf8')
const pkg = JSON.parse(json)

export default defineConfig({
  plugins: [
    sveltekit(),
    UnoCSS({
      injectReset: '@unocss/reset/tailwind.css',
    }),
  ],
  define: {
    PKG: pkg,
  },
})
