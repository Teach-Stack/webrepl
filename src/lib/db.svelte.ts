import svelteReactivityAdapter from '@signaldb/svelte'
import { REPLCollection as _REPLCollection } from './db'

export class REPLCollection extends _REPLCollection {
  constructor() {
    super({
      reactivity: svelteReactivityAdapter,
    })
  }
}
