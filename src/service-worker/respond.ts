// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference types="@types/serviceworker" />

/// <reference types="@sveltejs/kit" />

import mime from 'mime'

import { type REPL, REPLCollection, type Directory } from '../lib/db'
import { FourOFour, InternalServerError } from './errorPage'
import { atou } from '../lib'

function rewriteHTMLPaths(html: string): string {
  html = html
    // href attributes (links, stylesheets)
    .replace(/href=(["'])\/(?!preview\/)([^"']*)\1/g, 'href=$1/preview/$2$1')
    // src attributes (scripts, images, iframes)
    .replace(/src=(["'])\/(?!preview\/)([^"']*)\1/g, 'src=$1/preview/$2$1')
    // srcset attributes (responsive images)
    .replace(/srcset=(["'])([^"']*)\1/g, (_, quote, srcset) => {
      const rewritten = srcset.replace(
        /\/(?!preview\/)([^\s,]+)/g,
        '/preview/$1',
      )
      return `srcset=${quote}${rewritten}${quote}`
    })
    // data attributes that might contain paths
    .replace(
      /data-([^=]+)=(["'])\/(?!preview\/)([^"']*)\2/g,
      'data-$1=$2/preview/$3$2',
    )
    // poster attribute (video)
    .replace(
      /poster=(["'])\/(?!preview\/)([^"']*)\1/g,
      'poster=$1/preview/$2$1',
    )

  // Ensure base tag is present
  const baseTag = '<base href="/preview/">'
  if (html.match(/<head[^>]*>/i)) {
    html = html.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}`)
  } else {
    html = baseTag + html
  }

  return html
}

export async function respondWithREPLFiles(event: FetchEvent) {
  const url = new URL(event.request.url)

  console.debug('[webrepl:sw] Handling preview request for', url.pathname)

  const sharedRepl = (await cookieStore.get('sharedRepl'))?.value ?? null

  let repl: Pick<REPL, 'code'> | undefined

  if (sharedRepl) {
    console.debug('[webrepl:sw] Handling preview request with shared repl')
    try {
      console.debug('[webrepl:sw] Decoding shared repl from cookie', sharedRepl)
      const decoded = atou(sharedRepl)
      console.debug('[webrepl:sw] Decoded shared repl', decoded)
      const replCode = JSON.parse(decoded)
      console.debug('[webrepl:sw] Parsed shared repl JSON', replCode)
      repl = {
        code: replCode,
      }
      console.debug('[webrepl:sw] Successfully decoded shared repl', repl)
    } catch (error) {
      console.error(
        '[webrepl:sw] Failed to decode shared repl from cookie',
        error,
      )
      return new Response(InternalServerError('Invalid Shared REPL'), {
        status: 500,
      })
    }
  } else {
    console.debug('[webrepl:sw] Handling preview request with normal repl')
    const currentReplId =
      (await self.cookieStore.get('currentRepl'))?.value ?? null

    if (currentReplId === null) {
      console.debug('[webrepl:sw] No current repl ID found in cookies')
      throw new Error('No current REPL ID found')
    }
    console.debug('[webrepl:sw] Current repl is', currentReplId)

    console.debug('[webrepl:sw] Creating REPL collection instance')
    const replCollection = new REPLCollection()

    console.debug('[webrepl:sw] Waiting for REPL collection to be ready')
    await replCollection.isReady()

    console.debug('[webrepl:sw] REPL collection is ready, searching for repl')
    repl = replCollection.findOne({ id: { $eq: currentReplId } })

    if (repl === undefined) {
      console.error('[webrepl:sw] No repl found with ID', currentReplId)
      return new Response(InternalServerError('No REPL Found'), { status: 500 })
    }
    console.debug('[webrepl:sw] Found repl', repl)
  }

  const filePath =
    url.pathname === '/preview/'
      ? 'index.html'
      : url.pathname.replace('/preview/', '')

  console.debug('[webrepl:sw] Looking for file', filePath)

  // Navigate through the directory structure to find the file
  const findFile = (dir: Directory, path: string): string | undefined => {
    // Split the path and filter out empty parts
    const pathParts = path.split('/').filter((p) => p.length > 0)

    const navigate = (
      current: Directory,
      parts: string[],
    ): string | undefined => {
      if (parts.length === 1) {
        // We're at the target level - find the file
        const fileName = parts[0]
        const file = current.children.find(
          (child) => 'content' in child && child.name === fileName,
        )
        return file && 'content' in file ? file.content : undefined
      } else {
        // Navigate deeper into the directory structure
        const dirName = parts[0]
        const subDir = current.children.find(
          (child) => 'children' in child && child.name === dirName,
        )
        if (subDir && 'children' in subDir) {
          return navigate(subDir, parts.slice(1))
        }
        return undefined
      }
    }

    return navigate(dir, pathParts)
  }

  let fileData = findFile(repl.code, filePath)

  console.debug('[webrepl:sw] Found file data', fileData)

  if (typeof fileData === 'string') {
    console.debug('[webrepl:sw] Found file', filePath)
    console.debug(
      '[webrepl:sw] Responding with MIME type',
      filePath === '' ? 'text/html' : mime.getType(filePath),
    )

    if (filePath.endsWith('.html')) {
      console.debug('[webrepl:sw] Enforcing HTML base tag for file', filePath)
      fileData = rewriteHTMLPaths(fileData)
    }

    return new Response(fileData, {
      headers: { 'Content-Type': mime.getType(filePath) ?? 'text/plain' },
    })
  }

  return new Response(FourOFour(filePath), {
    status: 404,
    headers: { 'Content-Type': 'text/html' },
  })
}
