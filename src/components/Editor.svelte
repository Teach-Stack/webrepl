<script lang="ts">
  import CodeMirror from 'svelte-codemirror-editor'
  import { javascript } from '@codemirror/lang-javascript'
  import { css } from '@codemirror/lang-css'
  import { html } from '@codemirror/lang-html'

  import { editor, repls, preview } from '#lib/state/index.ts'

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

<div class="editor">
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
    class="code"
    styles={{
      '&': {
        height: '100%',
        fontSize: '18px',
      },
    }}
  />
</div>

<style>
  .editor {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: var(--pad-s);
    overflow: hidden;
  }

  .editor :global(.code) {
    background-color: white;
    border-radius: var(--br-m);
    overflow: hidden;
    border: 1px solid var(--slate-3);
  }

  @media (width >= 768px) {
    .editor {
      grid-template-columns: 300px 1fr;
    }
  }
</style>
