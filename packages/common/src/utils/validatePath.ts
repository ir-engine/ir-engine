export const validatePath = (url: string) => {
  var xhr = new XMLHttpRequest()
  xhr.open('HEAD', url, false)
  xhr.send()

  return xhr.status !== 404
}
