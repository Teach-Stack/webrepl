<svelte:options runes={true} />

<script lang="ts">
  import { utoa } from '#lib/encoding.ts'
  import { terminal, repls } from '#lib/state/index.ts'

  import RightOutline from '~icons/teenyicons/right-outline'
  import LeftOutline from '~icons/teenyicons/left-outline'
  import MinimiseOutline from '~icons/teenyicons/minimise-outline'
  import ExpandOutline from '~icons/teenyicons/expand-outline'

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

<div class="actions">
  <div>
    <button
      title={`${terminal.expanded ? 'Shrink' : 'Expand'} Output`}
      aria-label={`${terminal.expanded ? 'shrink' : 'expand'} code output`}
      aria-details="toggle expanded code output"
      aria-pressed={terminal.expanded}
      onclick={() => {
        terminal.expanded = !terminal.expanded
        setTimeout(() => {
          terminal.resize()
        }, 250)
      }}
    >
      {#if terminal.expanded}
        <RightOutline />
      {:else}
        <LeftOutline />
      {/if}
    </button>
    <button
      title={`${terminal.fullWidth ? 'Exit' : 'Enter'} Full Width Mode`}
      aria-label={`${terminal.fullWidth ? 'exit' : 'enter'} full width terminal mode`}
      aria-details="toggle full width terminal"
      aria-pressed={terminal.fullWidth}
      onclick={() => {
        terminal.fullWidth = !terminal.fullWidth
        setTimeout(() => {
          terminal.resize()
        }, 250)
      }}
    >
      {#if terminal.fullWidth}
        <MinimiseOutline />
      {:else}
        <ExpandOutline />
      {/if}
    </button>
  </div>
  <div>
    <button class="primary" aria-details="copy share link to code repl" onclick={shareRepl}>
      Share
    </button>
  </div>
</div>

<style>
  .actions {
    grid-area: actions;
    display: flex;
    justify-content: space-between;

    div {
      display: flex;
      align-items: center;
    }

    :first-child {
      gap: var(--pad-m);
    }

    :last-child {
      gap: var(--pad-l);
    }
  }
</style>
