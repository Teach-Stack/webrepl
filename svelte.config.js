import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html',
    }),
    paths: {
      base: process.argv.includes('dev') ? '' : process.env.PUBLIC_BASE_PATH,
    },
  },
  compilerOptions: {},
}

export default config
