<script lang="ts">
import { editor, repls } from '$lib/state'
import type { Directory } from '$lib/db.svelte'

const root = $derived(repls.getCurrentRepl()?.code)
</script>


{#snippet directory(dir: Directory, parent: string[] = [])}
  {#each dir.children as child}
    {@const key = child.name}
    {@const expanded = true}
    <li
      role="treeitem"
      class="hover:bg-slate-2 transition-colors w-full rounded px-1 cursor-pointer select-none aria-[selected='true']:bg-slate-2 aria-[selected='true']:font-medium"
      aria-selected="{editor.currentFilePath.join('/') === [...parent, key].join('/')}"
      aria-expanded="{expanded}"
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
        <span class="flex gap-1 items-center">
          {#if key.endsWith('.html')}
            <i class="i-ph:file-html"></i>
          {:else if key.endsWith('.css')}
            <i class="i-ph:file-css"></i>
          {:else if key.endsWith('.js')}
            <i class="i-ph:file-js"></i>
          {:else if key.endsWith('.jpg') || key.endsWith('.png') || key.endsWith('.gif') || key.endsWith('.svg')}
            <i class="i-ph:file-image"></i>
          {:else}
            <i class="i-ph:file"></i>
          {/if}
          {key}
        </span>
      {:else}
        <span>
          <i class="{expanded ? 'i-ph:folder-open' : 'i-ph:folder'}"></i>
          {key}
        </span>
        <ul role="group" class="ml-4">
          {@render directory(child, [...parent, child.name])}
        </ul>
      {/if}
    </li>
  {/each}
{/snippet}

<div class="bg-white rounded-lg border-1 border-slate-4 overflow-clip">
  <div class="px-4 py-2 border-b-1 border-slate-6 font-sans font-medium text-slate-11 bg-slate-1 text-xl">
    Files
  </div>
  {#if root}
    <ul role="tree" class="p-2 space-y-1 max-h-[80vh] overflow-y-auto">
      {@render directory(root, [])}
    </ul>
  {/if}
</div>