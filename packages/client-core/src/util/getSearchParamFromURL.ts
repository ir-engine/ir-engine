export const getSearchParamFromURL = (paramName: string): string | null => {
  const location = new URL(window.location as any)
  let params = new URLSearchParams(location.search)
  return params.get(paramName)
}
