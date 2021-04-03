type ReadAllProps = {
  onProgress?: (response: ArrayBuffer, loaded: number, total: number) => void
  onComplete: (response: ArrayBuffer) => void
}

export default class Stream {
  private url: string

  constructor(url: string) {
    this.url = url
  }

  readAll({ onProgress, onComplete }: ReadAllProps) {
    const xhr = new XMLHttpRequest()

    xhr.open('GET', this.url, true)
    xhr.responseType = 'arraybuffer'

    if (onProgress)
      xhr.onprogress = event =>
        onProgress(xhr.response, event.loaded, event.total)

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4)
        onComplete(xhr.response)
    }

    xhr.send(null)
  }
}
