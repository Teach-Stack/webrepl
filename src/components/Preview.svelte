<script lang="ts">
import RefreshOutline from '~icons/teenyicons/refresh-outline'
import DotsFade from '~icons/svg-spinners/3-dots-fade'

import { preview } from '#lib/state/index.ts'

let inputUrl = $state(preview.url)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    const input = event.target as HTMLInputElement
    preview.changeURL(input.value)
  }
}

function handleBlur() {
  inputUrl = preview.url
}

$effect(() => {
  inputUrl = preview.url
})
</script>


<div class="preview">
  {#if !preview.ready}
    <div class="loading">
      <DotsFade />
      <span>Loading...</span>
    </div>
  {:else}
    <div class="toolbar">
      <button
        onclick={() => preview.refresh()}
        class="success sm"
        title="Refresh Preview"
        aria-label="Refresh Website Preview"
      >
        <RefreshOutline />
      </button>
      <input
        type="text"
        bind:value={inputUrl}
        onkeydown={handleKeydown}
        onblur={handleBlur}
        aria-label="Preview URL"
      >
    </div>
    <iframe
      bind:this={preview.element}
      src="/preview/"
      title="website preview"
      onload={() => {
        preview.loading = false
        preview.updateURL()
      }}
      onerror={() => preview.loading = false}
    ></iframe>
  {/if}
</div>

<style>
  .preview {
    grid-area: output;
    display: flex;
    flex-direction: column;
    background-color: var(--slate-0);
    border-radius: var(--br-m);
    border: 1px solid var(--slate-3);
    overflow: hidden;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--slate-5);

    :global(svg) {
      font-size: 2.5rem;
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--pad-s);
    padding: var(--pad-s);
    border-bottom: var(--border-1);
    border-color: var(--slate-6);

    input {
      flex: 1;
      margin: 0;
    }
  }

  iframe {
    flex: 1;
    background-color: white;
    border: 0;
  }
</style>
