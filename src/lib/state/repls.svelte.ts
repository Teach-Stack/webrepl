import type { Directory, REPL } from '$lib/db'
import { REPLCollection } from '$lib/db.svelte'

import { nanoid } from 'nanoid'

const BASE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/styles.css">
      <title>Document</title>
  </head>
  <body>
    <p>Hello World</p>
  </body>
</html>`

const BASE_CSS = `body {
  font-family: sans-serif;
}`

type ReadOnlyREPL = Pick<REPL, 'code' | 'name'>

class REPLState {
  store: REPLCollection = new REPLCollection()

  ready: boolean = $state(false)

  currentReplId: string | null = $state(null)

  readOnlyRepl: ReadOnlyREPL | null = $state(null)

  setCurrentId(id: string) {
    this.currentReplId = id
    cookieStore.set('currentRepl', id)
    // localStorage.setItem('currentRepl', id)
  }

  setReadOnlyRepl(repl: ReadOnlyREPL | null) {
    this.readOnlyRepl = repl
  }

  getCurrentRepl() {
    if (this.currentReplId === null || !this.ready) return
    return this.store.findOne({ id: { $eq: this.currentReplId ?? '' } })
  }

  getFileContentInCurrentRepl(path: string[]): string | undefined {
    const repl = this.readOnlyRepl ?? this.getCurrentRepl()

    if (repl === undefined) return

    if (path.length === 0) return

    // Navigate through the directory structure to find the file
    const findFile = (
      dir: Directory,
      pathParts: string[],
    ): string | undefined => {
      if (pathParts.length === 1) {
        // We're at the target level - find the file
        const fileName = pathParts[0]
        const file = dir.children.find(
          (child) => 'content' in child && child.name === fileName,
        )
        return file && 'content' in file ? file.content : undefined
      } else {
        // Navigate deeper into the directory structure
        const dirName = pathParts[0]
        const subDir = dir.children.find(
          (child) => 'children' in child && child.name === dirName,
        )
        if (subDir && 'children' in subDir) {
          return findFile(subDir, pathParts.slice(1))
        }
        return undefined
      }
    }

    return findFile(repl.code, path)
  }

  addFileToCurrentRepl(path: string[], content: string) {
    if (this.currentReplId === null || !this.ready) return

    if (path.length === 0) return

    const repl = this.getCurrentRepl()
    if (!repl) return

    // Navigate through the directory structure to add the file
    const addFile = (dir: Directory, pathParts: string[]): Directory => {
      if (pathParts.length === 1) {
        // We're at the target level - add the file
        const fileName = pathParts[0]
        // Check if file already exists
        const fileExists = dir.children.some(
          (child) => 'content' in child && child.name === fileName,
        )
        if (fileExists) {
          // Update existing file
          return {
            ...dir,
            children: dir.children.map((child) =>
              'content' in child && child.name === fileName
                ? { ...child, content }
                : child,
            ),
          }
        } else {
          // Add new file
          return {
            ...dir,
            children: [...dir.children, { name: fileName, content }],
          }
        }
      } else {
        // Navigate deeper into the directory structure
        const dirName = pathParts[0]
        return {
          ...dir,
          children: dir.children.map((child) =>
            'children' in child && child.name === dirName
              ? addFile(child, pathParts.slice(1))
              : child,
          ),
        }
      }
    }

    const updatedCode = addFile(repl.code, path)

    this.store.updateOne(
      { id: { $eq: this.currentReplId } },
      {
        $set: {
          code: updatedCode,
          updated: new Date().toISOString(),
        },
      },
    )
  }

  addFolderToCurrentRepl(path: string[]) {
    if (this.currentReplId === null || !this.ready) return

    if (path.length === 0) return

    const repl = this.getCurrentRepl()
    if (!repl) return

    // Navigate through the directory structure to add the folder
    const addFolder = (dir: Directory, pathParts: string[]): Directory => {
      if (pathParts.length === 1) {
        // We're at the target level - add the folder
        const folderName = pathParts[0]
        // Check if folder already exists
        const folderExists = dir.children.some(
          (child) => 'children' in child && child.name === folderName,
        )
        if (folderExists) {
          // Folder already exists, return unchanged
          return dir
        } else {
          // Add new folder
          return {
            ...dir,
            children: [...dir.children, { name: folderName, children: [] }],
          }
        }
      } else {
        // Navigate deeper into the directory structure
        const dirName = pathParts[0]
        const subDir = dir.children.find(
          (child) => 'children' in child && child.name === dirName,
        )
        if (!subDir || !('children' in subDir)) {
          // Parent directory doesn't exist, create it
          const newChildren = [...dir.children]
          const existingIndex = newChildren.findIndex(
            (child) => child.name === dirName,
          )
          if (existingIndex >= 0) {
            // Replace existing non-directory item with directory
            newChildren[existingIndex] = { name: dirName, children: [] }
          } else {
            // Add new directory
            newChildren.push({ name: dirName, children: [] })
          }
          return {
            ...dir,
            children: newChildren.map((child) =>
              child.name === dirName && 'children' in child
                ? addFolder(child, pathParts.slice(1))
                : child,
            ),
          }
        }
        return {
          ...dir,
          children: dir.children.map((child) =>
            'children' in child && child.name === dirName
              ? addFolder(child, pathParts.slice(1))
              : child,
          ),
        }
      }
    }

    const updatedCode = addFolder(repl.code, path)

    this.store.updateOne(
      { id: { $eq: this.currentReplId } },
      {
        $set: {
          code: updatedCode,
          updated: new Date().toISOString(),
        },
      },
    )
  }

  deletePathInCurrentRepl(path: string[]) {
    if (this.currentReplId === null || !this.ready) return

    if (path.length === 0) return

    const repl = this.getCurrentRepl()
    if (!repl) return

    // Navigate through the directory structure to delete the file or directory
    const deletePath = (dir: Directory, pathParts: string[]): Directory => {
      if (pathParts.length === 1) {
        // We're at the target level - remove the file or directory
        const targetName = pathParts[0]
        return {
          ...dir,
          children: dir.children.filter((child) => child.name !== targetName),
        }
      } else {
        // Navigate deeper into the directory structure
        const dirName = pathParts[0]
        return {
          ...dir,
          children: dir.children.map((child) =>
            'children' in child && child.name === dirName
              ? deletePath(child, pathParts.slice(1))
              : child,
          ),
        }
      }
    }

    const updatedCode = deletePath(repl.code, path)

    this.store.updateOne(
      { id: { $eq: this.currentReplId } },
      {
        $set: {
          code: updatedCode,
          updated: new Date().toISOString(),
        },
      },
    )
  }

  updateFileInCurrentRepl(path: string[], content: string) {
    if (this.currentReplId === null || !this.ready) return

    if (path.length === 0) return

    const repl = this.getCurrentRepl()
    if (!repl) return

    // Navigate through the directory structure to find and update the file
    const updateFile = (dir: Directory, pathParts: string[]): Directory => {
      if (pathParts.length === 1) {
        // We're at the target level - update the file
        const fileName = pathParts[0]
        return {
          ...dir,
          children: dir.children.map((child) =>
            'content' in child && child.name === fileName
              ? { ...child, content }
              : child,
          ),
        }
      } else {
        // Navigate deeper into the directory structure
        const dirName = pathParts[0]
        return {
          ...dir,
          children: dir.children.map((child) =>
            'children' in child && child.name === dirName
              ? updateFile(child, pathParts.slice(1))
              : child,
          ),
        }
      }
    }

    const updatedCode = updateFile(repl.code, path)

    this.store.updateOne(
      { id: { $eq: this.currentReplId } },
      {
        $set: {
          code: updatedCode,
          updated: new Date().toISOString(),
        },
      },
    )
  }

  updateCurrentReplName(name: string) {
    if (this.currentReplId === null || !this.ready) return
    const trimmedName = name.trim()
    if (trimmedName === '') return
    this.store.updateOne(
      { id: { $eq: this.currentReplId } },
      { $set: { name: trimmedName, updated: new Date().toISOString() } },
    )
  }

  async create(value: Partial<REPL> = {}): Promise<string> {
    if (!this.ready) throw new Error('Database not ready')

    let finalName = value.name ?? 'Untitled'

    // If no custom name provided, check for existing "Untitled" names
    if (value.name === undefined) {
      const existingNames = this.store
        .find()
        .fetch()
        .map((repl) => repl.name)

      if (existingNames.includes('Untitled')) {
        let counter = 2
        while (existingNames.includes(`Untitled (${counter})`)) {
          counter++
        }
        finalName = `Untitled (${counter})`
      }
    }

    return await this.store.insert({
      id: nanoid(),
      name: finalName,
      code: {
        name: 'root',
        children: [
          {
            name: 'index.html',
            content: BASE_HTML,
          },
          {
            name: 'styles.css',
            content: BASE_CSS,
          },
        ],
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    })
  }

  findId(): string | undefined {
    if (!this.ready) throw new Error('Database not ready')

    const repl = this.store.findOne({})

    return repl?.id
  }

  async delete(id: string) {
    if (!this.ready) throw new Error('Database not ready')

    this.store.removeOne({ id: { $eq: id } })

    if (this.currentReplId === id) {
      const nextId = this.findId()

      if (nextId === undefined) {
        const id = await this.create()

        this.setCurrentId(id)
      } else {
        this.setCurrentId(nextId)
      }
    }
  }

  constructor() {
    this.store.isReady().then(async () => {
      const currentReplId =
        (await cookieStore.get('currentRepl'))?.value ?? null
      if (currentReplId !== null) {
        this.currentReplId = currentReplId
      }
      this.ready = true

      const count = this.store.find().count()

      if (count === 0) {
        const id = await this.create()

        this.setCurrentId(id)
      } else {
        const repl = this.store.findOne({
          id: { $eq: this.currentReplId ?? '' },
        })
        if (repl === undefined) {
          const id = this.findId()

          if (id === undefined) {
            throw new Error('Somehow no REPL found?!')
          }

          this.setCurrentId(id)
        }
      }
    })
  }
}

const repls = new REPLState()

export { repls }
