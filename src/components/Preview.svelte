<script lang="ts">
import Button from './ui/Button.svelte'

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


<div class="flex flex-col bg-gray-1 grid-area-[output] rounded-lg border-1 border-slate-4 overflow-hidden">
  {#if !preview.ready}
    <div class="flex items-center flex-col justify-center h-full">
      <span class="i-svg-spinners:3-dots-fade size-10"></span>
      <span class="text-slate-5">Loading...</span>
    </div>
  {:else}
    <div class="border-b-1 border-slate-6 flex bg-gray-1 p-2 gap-2 items-center">
    <Button
      onclick={() => preview.refresh()}
      variant="green"
      size="sm"
      title="Refresh Preview"
      aria-label="Refresh Website Preview"
    >
      <div class="i-teenyicons:refresh-outline size-4.5"></div>
    </Button>
    <input
      type="text"
      bind:value={inputUrl}
      onkeydown={handleKeydown}
      onblur={handleBlur}
      class="p-2 outline-none flex-1 border-1 rounded-lg focus:border-blue-6 text-xl font-sans"
    >
    
  </div>
  <iframe
    bind:this={preview.element}
    src="/preview/"
    class="flex-1 bg-white overflow-scroll"
    title="website preview"
    onload={() => {
      preview.loading = false
      preview.updateURL()
    }}
    onerror={() => preview.loading = false}
  ></iframe>
  {/if}
</div>

