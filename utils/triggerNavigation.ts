// trigger navigation e.g. between /explore, /video, /dream, /dreamscene
// use this in onClick of a button instead of <Link> or <a>
// in order to get dynamic routing (without reloading pages)
function triggerNavigation(url: string) {
  const clickEvent = new CustomEvent('navigate',
    {
      bubbles: true,
      detail: { url }
    }
  )
  document.dispatchEvent(clickEvent)
}

export default triggerNavigation
