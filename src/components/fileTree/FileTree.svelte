<script lang="ts">
import { editor, repls } from '$lib/state'

import type { Directory } from '$lib/db.svelte'

import AddFileDialog from './AddFileDialog.svelte'
import AddFolderDialog from './AddFolderDialog.svelte'
import ImageUploadDialog from './ImageUploadDialog.svelte'

import Button from '../ui/Button.svelte'

const root = $derived(repls.getCurrentRepl()?.code)

let showAddFileDialog = $state(false)
let showAddFolderDialog = $state(false)
let showImageUploadDialog = $state(false)
let dialogDirectory = $state<string[]>([])

function openAddFileDialog(directory: string[] = []) {
  dialogDirectory = directory
  showAddFileDialog = true
}

function openAddFolderDialog(directory: string[] = []) {
  dialogDirectory = directory
  showAddFolderDialog = true
}

function openImageUploadDialog(directory: string[] = []) {
  dialogDirectory = directory
  showImageUploadDialog = true
}
</script>


{#snippet directory(dir: Directory, parent: string[] = [])}
  {@const sortedChildren = dir.children.toSorted((a, b) => {
    // Directories first, then files
    const aIsDir = 'children' in a
    const bIsDir = 'children' in b
    
    if (aIsDir && !bIsDir) return -1
    if (!aIsDir && bIsDir) return 1
    
    // Within same type, sort alphabetically by name
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })}
  {#each sortedChildren as child}
    {@const key = child.name}
    {@const state = {expanded: true}}
    <li
      role="treeitem"
      class="select-none aria-[selected='true']:bg-slate-2 aria-[selected='true']:font-medium"
      aria-selected="{editor.currentFilePath.join('/') === [...parent, key].join('/')}"
      aria-expanded="{state.expanded}"
      onclick="{() => {
        if ('content' in child) {
          editor.currentFilePath = [...parent, child.name]
        }
      }}"
      onkeydown="{(e) => {
        if (e.key === 'Enter') {
          if ('content' in child) {
            editor.currentFilePath = [...parent, key]
          }
        }
      }}"
    >
      {#if 'content' in child}
        <span class="flex gap-1 items-center text-xl hover:bg-slate-2 transition-colors w-full cursor-pointer rounded px-1">
          {#if key.endsWith('.html')}
            <i class="i-ph:file-html"></i>
          {:else if key.endsWith('.css')}
            <i class="i-ph:file-css"></i>
          {:else if key.endsWith('.js')}
            <i class="i-ph:file-js"></i>
          {:else if key.endsWith('.jpg') || key.endsWith('.jpeg') || key.endsWith('.png') || key.endsWith('.gif') || key.endsWith('.svg') || key.endsWith('.webp') || key.endsWith('.bmp')}
            <i class="i-ph:file-image"></i>
          {:else}
            <i class="i-ph:file"></i>
          {/if}
          {key}
        </span>
      {:else}
        <span class="flex justify-between items-center group hover:bg-slate-2 transition-colors w-full cursor-pointer rounded px-1">
          <div class="flex gap-1 items-center text-xl">
            <i class="{state.expanded ? 'i-ph:folder-open' : 'i-ph:folder'}"></i>
            {key}
          </div>
          <span class="flex gap-1">
            <button
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-3 rounded transition-all"
              onclick={(e) => {
                e.stopPropagation()
                openAddFileDialog([...parent, child.name])
              }}
              title="Add file in this folder"
            >
              <div class="i-ph:file-plus text-slate-10"></div>
            </button>
            <button
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-3 rounded transition-all"
              onclick={(e) => {
                e.stopPropagation()
                openAddFolderDialog([...parent, child.name])
              }}
              title="Add folder in this folder"
            >
              <div class="i-ph:folder-plus text-slate-10"></div>
            </button>
            <button
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-3 rounded transition-all"
              onclick={(e) => {
                e.stopPropagation()
                openImageUploadDialog([...parent, child.name])
              }}
              title="Upload image to this folder"
            >
              <div class="i-ph:image-square text-slate-10"></div>
            </button>
          </span>
        </span>
        <ul role="group" class="ml-4">
          {@render directory(child, [...parent, child.name])}
        </ul>
      {/if}
    </li>
  {/each}
{/snippet}

<div class="bg-white rounded-lg border-1 border-slate-4 overflow-clip">
  <div class="px-4 py-2 border-b-1 border-slate-6 font-sans font-medium text-slate-11 bg-slate-1 text-xl flex justify-between items-center">
    <span>Files</span>
    <div class="flex gap-1">
      <Button 
        onclick={() => openAddFileDialog()}
        title="Add new file"
        size="sm"
      >
        <div class="i-ph:file-plus"></div>
      </Button>
      <Button
        onclick={() => openAddFolderDialog()}
        title="Create new folder"
        size="sm"
      >
        <div class="i-ph:folder-plus"></div>
      </Button>
      <Button
        onclick={() => openImageUploadDialog()}
        title="Upload image"
        size="sm"
      >
        <div class="i-ph:image-square"></div>
      </Button>
    </div>
  </div>
  {#if root}
    <ul role="tree" class="p-2 space-y-1 max-h-[80vh] overflow-y-auto">
      {@render directory(root, [])}
    </ul>
  {/if}
</div>

<AddFileDialog bind:open={showAddFileDialog} directory={dialogDirectory} />
<AddFolderDialog bind:open={showAddFolderDialog} directory={dialogDirectory} />
<ImageUploadDialog bind:open={showImageUploadDialog} directory={dialogDirectory} />
