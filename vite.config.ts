import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'

import { defineConfig } from 'vite'

import Icons from 'unplugin-icons/vite'

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const file = fileURLToPath(new URL('package.json', import.meta.url))
const json = readFileSync(file, 'utf8')
const pkg = JSON.parse(json)

export default defineConfig({
  plugins: [
    Icons({ compiler: 'svelte' }),
    sveltekit({
      adapter: adapter({
        fallback: 'index.html',
      }),
      paths: {
        base: process.argv.includes('dev')
          ? ''
          : (process.env.PUBLIC_BASE_PATH as `/${string}` | undefined),
      },
    }),
  ],
  define: {
    PKG: pkg,
  },
})
