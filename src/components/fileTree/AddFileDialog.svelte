<script lang="ts">
  import { repls, editor } from '#lib/state/index.ts'
  import type { Directory } from '#lib/db.ts'

  type Props = {
    open: boolean
    directory?: string[]
  }

  let { open = $bindable(false), directory = [] }: Props = $props()

  let newFileName = $state('')
  let fileNameError = $state('')

  function validateFileName(name: string): boolean {
    // Check for empty name
    if (!name.trim()) {
      fileNameError = 'File name cannot be empty'
      return false
    }

    // Only allow alphanumeric, dots, dashes, underscores
    const validPattern = /^[a-zA-Z0-9._-]+$/
    if (!validPattern.test(name)) {
      fileNameError = 'File name can only contain letters, numbers, dots, dashes, and underscores'
      return false
    }

    // Check if file already exists in current directory
    const repl = repls.getCurrentRepl()
    if (repl) {
      const checkExists = (dir: Directory, path: string[]): boolean => {
        if (path.length === 0) {
          return dir.children.some((child) => child.name === name)
        }
        const nextDir = dir.children.find((child) => 'children' in child && child.name === path[0])
        if (nextDir && 'children' in nextDir) {
          return checkExists(nextDir, path.slice(1))
        }
        return false
      }

      if (checkExists(repl.code, directory)) {
        fileNameError = 'A file with this name already exists'
        return false
      }
    }

    fileNameError = ''
    return true
  }

  function addFile() {
    if (validateFileName(newFileName)) {
      const fullPath = [...directory, newFileName]
      repls.addFileToCurrentRepl(fullPath, '')
      editor.currentFilePath = fullPath

      open = false
    }
  }

  $effect(() => {
    if (open) {
      newFileName = ''
      fileNameError = ''
    }
  })
  let dialog: HTMLDialogElement

  $effect(() => {
    if (open) dialog.showModal()
    else dialog.close()
  })
</script>

<dialog bind:this={dialog} onclose={() => (open = false)} closedby="any">
  <div class="stack">
    <div>
      <h5>Add New File</h5>
      <p>
        {#if directory.length > 0}
          Creating file in: <code>{directory.join('/')}/</code>
        {:else}
          Creating file in root directory
        {/if}
      </p>
    </div>

    <div>
      <label for="fileName">File Name</label>
      <input
        id="fileName"
        type="text"
        bind:value={newFileName}
        oninput={() => (fileNameError = '')}
        placeholder="example.html"
        aria-invalid={fileNameError !== ''}
        aria-describedby="fileNameHint"
      />
      {#if fileNameError}
        <small>{fileNameError}</small>
      {/if}
      <small id="fileNameHint" class="hint">
        Only letters, numbers, dots, dashes, and underscores allowed
      </small>
    </div>

    <div class="flex">
      <button onclick={() => (open = false)}> Cancel </button>
      <button class="primary" onclick={addFile}> Create File </button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    color: var(--slate-9);
  }

  h5 {
    margin-bottom: var(--vs-s);
  }

  input {
    font-family: monospace;
  }

  .hint {
    --fl: -1;
    display: block;
    color: var(--slate-9);
  }

  .flex {
    justify-content: end;
    gap: var(--pad-s);
  }
</style>
