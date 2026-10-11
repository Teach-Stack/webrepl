<script lang="ts">
import { goto } from '$app/navigation'
import { page } from '$app/state'

import { repls, editor } from '#lib/state/index.ts'
import { atou } from '#lib/encoding.ts'

let sharedName = $derived(page.url.searchParams.get('name'))

let sharedRepl = $derived(page.url.searchParams.get('code'))

async function saveAsNew() {
  if (!repls.ready || sharedRepl === null) return

  const decoded = atou(sharedRepl)
  const codeObj = JSON.parse(decoded)

  const id = await repls.create({
    name: sharedName ?? 'Untitled',
    code: codeObj,
  })
  repls.setCurrentId(id)
  editor.readOnly = false
  goto('/')
}
</script>

{#if editor.readOnly}
  <div class="primary alert split">
    <div>
      <h5>Read Only Mode</h5>
      <p class="fs-xs">You are viewing a shared REPL, save a copy to make changes</p>
    </div>
    <button onclick={saveAsNew}>
      Save
    </button>
  </div>
{/if}

<style>
  .alert {
    grid-area: banner;
  }
</style>
