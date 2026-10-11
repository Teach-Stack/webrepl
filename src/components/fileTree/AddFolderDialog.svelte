<script lang="ts">
  import { repls } from '#lib/state/index.ts'
  import type { Directory } from '#lib/db.ts'

  type Props = {
    open: boolean
    directory?: string[]
  }

  let { open = $bindable(false), directory = [] }: Props = $props()

  let newFolderName = $state('')
  let folderNameError = $state('')

  function validateFolderName(name: string): boolean {
    // Check for empty name
    if (!name.trim()) {
      folderNameError = 'Folder name cannot be empty'
      return false
    }

    // Only allow alphanumeric, dashes, underscores (no dots for folders)
    const validPattern = /^[a-zA-Z0-9_-]+$/
    if (!validPattern.test(name)) {
      folderNameError = 'Folder name can only contain letters, numbers, dashes, and underscores'
      return false
    }

    // Check if folder already exists in current directory
    const repl = repls.getCurrentRepl()
    if (repl) {
      const checkExists = (dir: Directory, path: string[]): boolean => {
        if (path.length === 0) {
          return dir.children.some((child) => 'children' in child && child.name === name)
        }
        const nextDir = dir.children.find((child) => 'children' in child && child.name === path[0])
        if (nextDir && 'children' in nextDir) {
          return checkExists(nextDir, path.slice(1))
        }
        return false
      }

      if (checkExists(repl.code, directory)) {
        folderNameError = 'A folder with this name already exists'
        return false
      }
    }

    folderNameError = ''
    return true
  }

  function addFolder() {
    if (validateFolderName(newFolderName)) {
      const fullPath = [...directory, newFolderName]
      repls.addFolderToCurrentRepl(fullPath)

      open = false
    }
  }

  // Reset state when dialog opens
  $effect(() => {
    if (open) {
      newFolderName = ''
      folderNameError = ''
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
      <h5>Create New Folder</h5>
      <p>
        {#if directory.length > 0}
          Creating folder in: <code>{directory.join('/')}/</code>
        {:else}
          Creating folder in root directory
        {/if}
      </p>
    </div>

    <div>
      <label for="folderName">Folder Name</label>
      <input
        id="folderName"
        type="text"
        bind:value={newFolderName}
        oninput={() => (folderNameError = '')}
        placeholder="my-folder"
        aria-invalid={folderNameError !== ''}
        aria-describedby="folderNameHint"
      />
      {#if folderNameError}
        <small>{folderNameError}</small>
      {/if}
      <small id="folderNameHint" class="hint">
        Only letters, numbers, dashes, and underscores allowed
      </small>
    </div>

    <div class="flex">
      <button onclick={() => (open = false)}> Cancel </button>
      <button class="primary" onclick={addFolder}> Create Folder </button>
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
