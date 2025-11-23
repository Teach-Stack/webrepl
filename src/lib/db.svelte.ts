import { Collection, createIndex } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import svelteReactivityAdapter from '@signaldb/svelte'

type File = {
  name: string
  content: string
}

export interface Directory {
  name: string
  children: Array<File | Directory>
}

export interface REPL {
  id: string
  name: string
  code: Directory
  created: string
  updated: string
}

export class REPLCollection extends Collection<REPL> {
  constructor(reactive: boolean = true) {
    super({
      name: 'repls',
      persistence: createIndexedDBAdapter('repls'),
      indices: [createIndex('id'), createIndex('name')],
      reactivity: reactive ? svelteReactivityAdapter : undefined,
      enableDebugMode: true,
    })
  }
}
