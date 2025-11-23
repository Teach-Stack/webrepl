class PreviewState {
  url = $state<string>('/index.html')
  element = $state<HTMLIFrameElement>()

  loading = $state<boolean>(false)

  refresh() {
    if (this.element?.contentWindow) {
      this.element.contentWindow.location.reload()
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
