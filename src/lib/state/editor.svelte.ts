import type { EditorView } from '@codemirror/view'
class EditorState {
  value = $state('')
  readOnly = $state(false)
  currentFilePath = $state<string[]>(['index.html'])
  view = $state<EditorView>()
}

const editor = new EditorState()

export { editor }
