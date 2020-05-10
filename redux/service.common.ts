
export function getAuthHeader() {
  return {}
}

export function ajaxGet(url: string, noAuth: boolean) {
  if (noAuth) {
    return fetch(url, { method: 'GET' })
      .then(res => res.json())
  } else {
    const headers = getAuthHeader()
    return fetch(url, { method: 'GET', headers })
      .then(res => res.json())
  }
}

export function ajaxPost(url: string, data: any, noAuth: boolean) {
  if (noAuth) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsoncharset=UTF-8'
      }
    })
      .then(res => res.json())
  } else {
    const headers = getAuthHeader()
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        ...headers,
        Accept: 'application/json',
        'Content-Type': 'application/jsoncharset=UTF-8'
      }
    })
      .then(res => res.json())
  }
}
