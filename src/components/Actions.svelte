<script lang="ts">
import { utoa } from '$lib'
import { terminal, repls } from '$lib/state'

import Button from './ui/Button.svelte'

function shareRepl() {
  const currentRepl = repls.getCurrentRepl()
  if (!currentRepl) {
    console.error('[webrepl:shareCode] no current repl to share')
    return
  }
  const hash = utoa(JSON.stringify(currentRepl.code))
  const url = new URL(window.location.toString())
  url.searchParams.set('code', hash)
  url.searchParams.set('name', currentRepl.name)
  console.debug('[webrepl:shareCode] share url:', url.toString())

  navigator.clipboard.writeText(url.toString())
  alert('Link Copied')
}
</script>
<svelte:options runes={true} />

<div class="grid-area-[actions] flex items-center justify-center lg:justify-between px-2">
  <div class="hidden lg:flex gap-2">
    <Button
      title={`${terminal.expanded ? 'Shrink' : 'Expand'} Output`}
      aria-label={`${terminal.expanded ? 'shrink' : 'expand'} code output`}
      aria-details="toggle expanded code output"
      aria-pressed={terminal.expanded}
      onclick={() => {
        terminal.expanded = !terminal.expanded
        setTimeout(()=> {
          terminal.resize()
        }, 250)
      }}
    >
      {#if terminal.expanded}
        <div class="i-teenyicons:right-outline size-5.75"></div>
      {:else}
        <div class="i-teenyicons:left-outline size-5.75"></div>
      {/if}
    </Button>
    <Button
      title={`${terminal.fullWidth ? 'Exit' : 'Enter'} Full Width Mode`}
      aria-label={`${terminal.fullWidth ? 'exit' : 'enter'} full width terminal mode`}
      aria-details="toggle full width terminal"
      aria-pressed={terminal.fullWidth}
      onclick={() => {
        terminal.fullWidth = !terminal.fullWidth
        setTimeout(()=> {
          terminal.resize()
        }, 250)
      }}
    >
      {#if terminal.fullWidth}
        <div class="i-teenyicons:minimise-outline size-5.75"></div>
      {:else}
        <div class="i-teenyicons:expand-outline size-5.75"></div>
      {/if}
    </Button>
  </div>
  <div class="flex gap-4 items-center">
    <Button 
      variant="blue"
      aria-details="copy share link to code repl"
      onclick={shareRepl}
    >
      Share
    </Button>
  </div>

</div>