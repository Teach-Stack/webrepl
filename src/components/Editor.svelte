<script lang="ts">
import CodeMirror from 'svelte-codemirror-editor'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'

import { editor, repls, preview } from '$lib/state'

import FileTree from './fileTree/FileTree.svelte'

$effect(() => {
  const currentRepl = repls.getCurrentRepl()
  if (currentRepl) {
    if (editor.currentFilePath) {
      const content = repls.getFileContentInCurrentRepl(editor.currentFilePath)
      if (content !== undefined) {
        editor.value = content
      }
    }
  }
})

const language = $derived(() => {
  if (editor.currentFilePath) {
    const filename = editor.currentFilePath[editor.currentFilePath.length - 1]
    if (filename.endsWith('.js')) {
      return javascript()
    } else if (filename.endsWith('.css')) {
      return css()
    } else if (filename.endsWith('.html')) {
      return html()
    }
  }
  return undefined
})
</script>

<div class="grid  grid-cols-[1fr_3fr] md:grid-cols-[300px_1fr] gap-2 overflow-hidden">
  <FileTree />
  <CodeMirror
    bind:value={editor.value}
    onready={(view) => (editor.view = view)}
    onchange={(val) => {
      repls.updateFileInCurrentRepl(editor.currentFilePath!, val)
      preview.refresh()
    }}
    readonly={editor.readOnly}
    lang={language()}
    class="rounded-lg overflow-hidden bg-white transition-all border-1 border-slate-4"
    styles={{
      '&': {
        height: '100%',
        fontSize: '18px'
      }
    }}
  />
</div>