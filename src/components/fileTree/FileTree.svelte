<script lang="ts">
import { editor, repls } from '#lib/state/index.ts'

import type { Directory } from '#lib/db.ts'

import AddFileDialog from './AddFileDialog.svelte'
import AddFolderDialog from './AddFolderDialog.svelte'

import FileIcon from '~icons/ph/file'
import FileHtml from '~icons/ph/file-html'
import FileCss from '~icons/ph/file-css'
import FileJs from '~icons/ph/file-js'
import FileImage from '~icons/ph/file-image'
import FilePlus from '~icons/ph/file-plus'
import FolderIcon from '~icons/ph/folder'
import FolderOpen from '~icons/ph/folder-open'
import FolderPlus from '~icons/ph/folder-plus'

const root = $derived(repls.getCurrentRepl()?.code)

let showAddFileDialog = $state(false)
let showAddFolderDialog = $state(false)
let dialogDirectory = $state<string[]>([])

function openAddFileDialog(directory: string[] = []) {
  dialogDirectory = directory
  showAddFileDialog = true
}

function openAddFolderDialog(directory: string[] = []) {
  dialogDirectory = directory
  showAddFolderDialog = true
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
        <span class="item">
          {#if key.endsWith('.html')}
            <FileHtml />
          {:else if key.endsWith('.css')}
            <FileCss />
          {:else if key.endsWith('.js')}
            <FileJs />
          {:else if key.endsWith('.jpg') || key.endsWith('.png') || key.endsWith('.gif') || key.endsWith('.svg')}
            <FileImage />
          {:else}
            <FileIcon />
          {/if}
          {key}
        </span>
      {:else}
        <span class="item folder">
          <span class="item">
            {#if state.expanded}
              <FolderOpen />
            {:else}
              <FolderIcon />
            {/if}
            {key}
          </span>
          <span class="folder-actions">
            <button
              class="unstyled"
              onclick={(e) => {
                e.stopPropagation()
                openAddFileDialog([...parent, child.name])
              }}
              title="Add file in this folder"
            >
              <FilePlus />
            </button>
            <button
              class="unstyled"
              onclick={(e) => {
                e.stopPropagation()
                openAddFolderDialog([...parent, child.name])
              }}
              title="Add folder in this folder"
            >
              <FolderPlus />
            </button>
          </span>
        </span>
        <ul role="group">
          {@render directory(child, [...parent, child.name])}
        </ul>
      {/if}
    </li>
  {/each}
{/snippet}

<div class="files">
  <div class="files-header">
    <span>Files</span>
    <div class="buttons">
      <button
        onclick={() => openAddFileDialog()}
        title="Add new file"
        class="sm"
      >
        <FilePlus />
      </button>
      <button
        onclick={() => openAddFolderDialog()}
        title="Create new folder"
        class="sm"
      >
        <FolderPlus />
      </button>
    </div>
  </div>
  {#if root}
    <ul role="tree">
      {@render directory(root, [])}
    </ul>
  {/if}
</div>

<AddFileDialog bind:open={showAddFileDialog} directory={dialogDirectory} />
<AddFolderDialog bind:open={showAddFolderDialog} directory={dialogDirectory} />

<style>
  .files {
    background-color: white;
    border-radius: var(--br-m);
    border: 1px solid var(--slate-3);
    overflow: clip;
  }

  .files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--pad-s) var(--pad-l);
    border-bottom: var(--border-1);
    border-color: var(--slate-6);
    background-color: var(--slate-0);
    color: var(--slate-9);
    font-size: 1.25rem;
    font-weight: 500;

    .buttons {
      display: flex;
      gap: var(--pad-xs);
    }
  }

  ul {
    list-style: none;
    padding: 0;
    padding-inline-start: var(--pad-l);
  }

  ul[role='tree'] {
    display: flex;
    flex-direction: column;
    gap: var(--pad-xs);
    padding: var(--pad-s);
    max-height: 80vh;
    overflow-y: auto;
  }

  li {
    --fl: 1;
    user-select: none;

    &[aria-selected='true'] > .item {
      background-color: var(--slate-1);
      font-weight: 500;
    }
  }

  .item {
    display: flex;
    align-items: center;
    gap: var(--pad-xs);
    width: 100%;
    padding-inline: var(--pad-xs);
    border-radius: var(--br-s);
    cursor: pointer;
    transition: background-color 0.2s var(--ease-smooth);

    &:hover {
      background-color: var(--slate-1);
    }

    :global(svg) {
      flex-shrink: 0;
    }

    .item {
      padding: 0;
      &:hover {
        background-color: transparent;
      }
    }
  }

  .folder {
    justify-content: space-between;

    &:hover .folder-actions button {
      opacity: 1;
    }
  }

  .folder-actions {
    display: flex;
    gap: var(--pad-xs);

    button {
      --fl: 0;
      display: inline-flex;
      padding: var(--pad-xs);
      background: none;
      border: 0;
      border-radius: var(--br-s);
      color: var(--slate-9);
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s var(--ease-smooth);

      &:hover {
        background-color: var(--slate-2);
      }

      &:focus-visible {
        opacity: 1;
      }
    }
  }
</style>
