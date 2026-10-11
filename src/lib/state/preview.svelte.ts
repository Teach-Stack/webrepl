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
    try {
      const path = this.element?.contentWindow?.location.pathname
      if (path) this.url = path.replace('/preview', '')
    } catch {
      // iframe navigated cross-origin (or to a browser error page); keep the last url
    }
  }
}

const preview = new PreviewState()

export { preview }
