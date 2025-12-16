import { Collection, createIndex, type CollectionOptions } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'

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
  constructor(opts: CollectionOptions<REPL, any> = {}) {
    super({
      ...opts,
      name: 'repls',
      persistence: createIndexedDBAdapter('repls'),
      indices: [createIndex('id'), createIndex('name')],
      enableDebugMode: true,
    })
  }
}
