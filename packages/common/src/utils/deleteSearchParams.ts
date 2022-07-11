export const deleteSearchParams = (param: string) => {
  const location = new URL(window.location as any)
  location.searchParams.delete(param)
  window.history.pushState({}, document.title, '/' + location.search)
}
