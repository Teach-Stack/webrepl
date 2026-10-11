<script lang="ts">
import Dialog from '../ui/Dialog.svelte'
import Button from '../ui/Button.svelte'

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
    fileNameError =
      'File name can only contain letters, numbers, dots, dashes, and underscores'
    return false
  }

  // Check if file already exists in current directory
  const repl = repls.getCurrentRepl()
  if (repl) {
    const checkExists = (dir: Directory, path: string[]): boolean => {
      if (path.length === 0) {
        return dir.children.some((child) => child.name === name)
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
</script>

<Dialog bind:open>
  {#snippet title()}
    <h2 class="text-2xl font-semibold">Add New File</h2>
  {/snippet}
  
  {#snippet description()}
    <p class="text-slate-11">
      {#if directory.length > 0}
        Creating file in: <span class="font-mono text-sm">{directory.join('/')}/</span>
      {:else}
        Creating file in root directory
      {/if}
    </p>
  {/snippet}
  
  <div class="space-y-4">
    <div>
      <label for="fileName" class="block text-sm font-medium mb-2">
        File Name
      </label>
      <input
        id="fileName"
        type="text"
        bind:value={newFileName}
        oninput={() => fileNameError = ''}
        placeholder="example.html"
        class="w-full px-3 py-2 border-1 border-slate-4 rounded focus:outline-none focus:border-blue-5 font-mono"
      />
      {#if fileNameError}
        <p class="text-red-9 text-sm mt-1">{fileNameError}</p>
      {/if}
      <p class="text-slate-10 text-xs mt-1">
        Only letters, numbers, dots, dashes, and underscores allowed
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
        onclick={addFile}
      >
        Create File
      </Button>
    </div>
  </div>
</Dialog>