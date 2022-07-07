export const deleteSearchParams = (param: string) => {
  const location = new URL(window.location as any)
  location.searchParams.delete(param)
  console.log(location, location.search)
  window.history.pushState({}, document.title, '/' + location.search)
  // window.location.replace(location.href)
}
