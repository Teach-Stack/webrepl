<script lang="ts">
import Dialog from '../ui/Dialog.svelte'
import Button from '../ui/Button.svelte'

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
    folderNameError =
      'Folder name can only contain letters, numbers, dashes, and underscores'
    return false
  }

  // Check if folder already exists in current directory
  const repl = repls.getCurrentRepl()
  if (repl) {
    const checkExists = (dir: Directory, path: string[]): boolean => {
      if (path.length === 0) {
        return dir.children.some(
          (child) => 'children' in child && child.name === name,
        )
      }
      const nextDir = dir.children.find(
        (child) => 'children' in child && child.name === path[0],
      )
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
</script>

<Dialog bind:open>
  {#snippet title()}
    <h2 class="text-2xl font-semibold">Create New Folder</h2>
  {/snippet}
  
  {#snippet description()}
    <p class="text-slate-11">
      {#if directory.length > 0}
        Creating folder in: <span class="font-mono text-sm">{directory.join('/')}/</span>
      {:else}
        Creating folder in root directory
      {/if}
    </p>
  {/snippet}
  
  <div class="space-y-4">
    <div>
      <label for="folderName" class="block text-sm font-medium mb-2">
        Folder Name
      </label>
      <input
        id="folderName"
        type="text"
        bind:value={newFolderName}
        oninput={() => folderNameError = ''}
        placeholder="my-folder"
        class="w-full px-3 py-2 border-1 border-slate-4 rounded focus:outline-none focus:border-blue-5 font-mono"
      />
      {#if folderNameError}
        <p class="text-red-9 text-sm mt-1">{folderNameError}</p>
      {/if}
      <p class="text-slate-10 text-xs mt-1">
        Only letters, numbers, dashes, and underscores allowed
      </p>
    </div>
    
    <div class="flex justify-end gap-2">
      <Button 
        variant="default" 
        onclick={() => open = false}
      >
        Cancel
      </Button>
      <Button 
        variant="blue" 
        onclick={addFolder}
      >
        Create Folder
      </Button>
    </div>
  </div>
</Dialog>