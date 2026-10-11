<script lang="ts">
import DocumentsOutline from '~icons/teenyicons/documents-outline'
import BinOutline from '~icons/teenyicons/bin-outline'

import { repls } from '#lib/state/index.ts'

let open = $state(false)
let dialog: HTMLDialogElement

$effect(() => {
  if (open) dialog.showModal()
  else dialog.close()
})

let userRepls = $derived(repls.ready ? repls.store.find().fetch() : [])

function switchToRepl(id: string) {
  repls.setCurrentId(id)
  open = false
}

async function createNewRepl() {
  const id = await repls.create()
  repls.setCurrentId(id)
  open = false
}

async function deleteRepl(id: string) {
  await repls.delete(id)
}

const sortedRepls = $derived(
  [...userRepls].sort(
    (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime(),
  ),
)
</script>


<button
  onclick={() => (open = true)}
  aria-label="Open REPL Management"
  title="Manage Your REPLs"
>
  <DocumentsOutline />
</button>

<dialog bind:this={dialog} onclose={() => (open = false)} closedby="any">
  <h5>Your REPLs</h5>

  <div class="stack">
    <button
      class="success block"
      onclick={createNewRepl}
      aria-label="Create new REPL"
      title="Create New REPL"
    >
      New REPL
    </button>
    <hr />
    <div class="reel">
      {#each sortedRepls as repl (repl.id)}
        {@const isCurrent = repl.id === repls.currentReplId}
        <div
          class:current={isCurrent}
          class="repl"
        >
          <button
            onclick={() => switchToRepl(repl.id)}
            class="unstyled"
            aria-label="Switch to {repl.name}"
          >
            <div class="cluster">
              <span>
                {repl.name}
              </span>
              {#if isCurrent}
                <span class="primary tag">
                  Current
                </span>
              {/if}
            </div>
            <time class="fluid" datetime={repl.updated}>
              Updated {repl.updated}
            </time>
          </button>

          {#if userRepls.length > 1}
            <button
              onclick={(e) => {
                e.stopPropagation()
                deleteRepl(repl.id)
              }}
              aria-label="Delete {repl.name}"
              title="Delete REPL"
              class="error sm"
            >
              <BinOutline />
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</dialog>

<style>
  dialog {
    max-width: 50ch;
  }
  h5 {
    margin-bottom: var(--vs-s);
    color: var(--slate-9);
  }

  .stack {
    --layout-gap: var(--pad-m);
  }

  hr {
    border: 1px solid var(--slate-2);
  }

  .reel {
    --layout-gap: var(--pad-s);
    max-height: 400px;
    /* overflow-y: scroll; */
    
    .repl {
      display: flex;
      align-items: center;
      border-radius: var(--br-s);
      padding: var(--pad-m);
      gap: var(--pad-xs);

      background-color: white;
      border: 1px solid var(--slate-4);

      .cluster {
        margin-bottom: var(--pad-xs)
      }
      .tag {
        line-height: var(--lh-xs);
        opacity: .8;
      }

      
      &.current {
        border-color: var(--blue-3);
        background-color: var(--blue-0);
      }

      time {
        opacity: .7;
        --fl: -1;
      }

      button.unstyled {
        color: var(--slate-9);
        background: none;
        border: none;
        cursor: pointer;
        flex: 1;
        text-align: left;
        min-width: 0;
      }

      button.error.sm {
        --fl: -1;
      }
    }
  }
</style>