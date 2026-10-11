<script lang="ts">
import Button from './ui/Button.svelte'

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
  <div class="grid-area-[banner] bg-gray-50 border-1 border-gray-4 px-2 py-1.5 flex items-center justify-between gap-2 rounded">
    <p class="text-md text-gray-8 font-sans font-bold">
      You're viewing a shared REPL (read-only)
    </p>
    <Button variant="blue" onclick={saveAsNew}>
      Save
    </Button>
  </div>
{/if}
