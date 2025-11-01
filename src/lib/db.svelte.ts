import { Collection, createIndex } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import svelteReactivityAdapter from '@signaldb/svelte'

interface File {
  name: string
  content: string
}

interface Directory {
  name: string
  children: Array<File | Directory>
}

export interface REPL {
  id: string
  name: string
  code: Array<File | Directory>
  created: string
  updated: string
}

export class REPLCollection extends Collection<REPL> {
  constructor() {
    super({
      name: 'repls',
      persistence: createIndexedDBAdapter('repls'),
      indices: [createIndex('id'), createIndex('name')],
      reactivity: svelteReactivityAdapter,
    })
  }
}
