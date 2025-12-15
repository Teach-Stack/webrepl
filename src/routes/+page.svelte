<script lang="ts">
import Actions from '../components/Actions.svelte'
import Editor from '../components/Editor.svelte'
import Header from '../components/Header.svelte'
import ReadOnlyBanner from '../components/ReadOnlyBanner.svelte'
import Welcome from '../components/Welcome.svelte'
import Preview from '../components/Preview.svelte'

import { repls, terminal, editor, preview } from '$lib/state'
import { page } from '$app/state'
import { atou } from '$lib'

let sharedRepl = $derived(page.url.searchParams.get('code'))

$effect(() => {
  if (sharedRepl !== null) {
    try {
      const decoded = atou(sharedRepl)
      console.debug('[webrepl:page] loading shared code:', decoded)
      const codeObj = JSON.parse(decoded)
      console.debug('[webrepl:page] parsed shared code object:', codeObj)
      cookieStore.set('sharedRepl', sharedRepl)
      repls.setReadOnlyRepl({
        name: page.url.searchParams.get('name') || 'Untitled',
        code: codeObj,
      })
      editor.readOnly = true
    } catch (e) {
      console.error('[webrepl:page] failed to load shared code:', e)
    }
  } else {
    console.debug('[webrepl:page] no shared code found in URL')
    console.debug('[webrepl:page] clearing shared repl state')
    cookieStore.delete('sharedRepl')
    repls.setReadOnlyRepl(null)
  }

  preview.ready = true
})
</script>

<svelte:window onresize={terminal.resize} />

<svelte:head>
  <title>WebREPL - Web Based Python Environment</title>
</svelte:head>
<Welcome />
<main
  class="gap-2 p-2 bg-slate-2 overflow-hidden transition-all"
  class:biggerTerminal={terminal.expanded}
  class:fullWidthTerminal={terminal.fullWidth}
  class:readOnly={editor.readOnly}
>
  <Header />

  <ReadOnlyBanner />

  <Actions />

  {#if !terminal.fullWidth}
  <Editor />
  {/if}

  <Preview />
</main>

<style>
main {
  height: 100vh;
  display: grid;
  grid-template-rows: repeat(2, 48px 1fr);
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "editor"
    "actions"
    "output"
}

main.readOnly {
  grid-template-rows: 48px 64px 1fr 48px 1fr;
  grid-template-areas:
    "header"
    "banner"
    "editor"
    "actions"
    "output"
}

@screen xl {
  main {
    grid-template-columns: 1.2fr minmax(384px, 0.8fr);
    grid-template-rows: 48px 1fr;
    grid-template-areas:
      "header actions"
      "editor output";
  }

  main.readOnly {
    grid-template-rows: 48px auto 1fr;
    grid-template-areas:
      "header actions"
      "banner output"
      "editor output";
  }

  main.biggerTerminal {
    grid-template-columns: minmax(384px, 0.8fr) 1.2fr;
  }

  main.fullWidthTerminal {
    grid-template-areas:
      "header actions"
      "output output";
  }

  main.fullWidthTerminal.readOnly {
    grid-template-areas:
      "header actions"
      "banner"
      "output output";
  }
}

:global(.xterm) {
  padding: 1rem 1rem 4px;
}
</style>
