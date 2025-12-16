class PreviewState {
  url = $state<string>('/')
  element = $state<HTMLIFrameElement>()

  loading = $state<boolean>(false)

  ready = $state<boolean>(false)

  refresh() {
    if (this.element?.contentWindow) {
      this.loading = true
      this.element.contentWindow.location.reload()
    }
  }

  changeURL(newURL: string) {
    if (this.element?.contentWindow) {
      this.loading = false
      this.url = newURL
      this.element.contentWindow.location.href = `/preview${newURL}`
    }
  }

  updateURL() {
    if (this.element?.contentWindow) {
      this.url = this.element.contentWindow.location.pathname.replace(
        '/preview',
        '',
      )
    }
  }
}

const preview = new PreviewState()

export { preview }
