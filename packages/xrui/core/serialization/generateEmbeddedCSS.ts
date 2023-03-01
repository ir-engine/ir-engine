import { WebRenderer } from '../WebRenderer'
import { getEmbeddedDataURL } from './getEmbeddedDataURL'

export async function getEmbeddedCSS(url: string) {
  if (WebRenderer.embeddedCSSMap.has(url)) return WebRenderer.embeddedCSSMap.get(url)!
  const res = await fetch(url, { headers: { accept: 'text/css' } })
  const css = await generateEmbeddedCSS(url, await res.text())
  WebRenderer.embeddedCSSMap.set(url, css)
  return WebRenderer.embeddedCSSMap.get(url)!
}

export async function generateEmbeddedCSS(url: string, css: string): Promise<string> {
  let found: RegExpExecArray | null
  const promises = [] as Promise<any>[]

  // Add classes for psuedo-classes
  css = css.replace(new RegExp(':hover', 'g'), WebRenderer.attributeCSS(WebRenderer.HOVER_ATTRIBUTE))
  css = css.replace(new RegExp(':active', 'g'), WebRenderer.attributeCSS(WebRenderer.ACTIVE_ATTRIBUTE))
  css = css.replace(new RegExp(':focus', 'g'), WebRenderer.attributeCSS(WebRenderer.FOCUS_ATTRIBUTE))
  css = css.replace(new RegExp(':target', 'g'), WebRenderer.attributeCSS(WebRenderer.TARGET_ATTRIBUTE))

  // Replace all urls in the css
  const regEx = RegExp(/(@import.*?["']([^"']+)["'].*?|url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\))/gi)
  while ((found = regEx.exec(css))) {
    const isCSSImport = !!found[2]
    const accept = isCSSImport ? 'type/css' : undefined
    const resourceURL = found[2] || found[3]
    promises.push(
      getEmbeddedDataURL(new URL(resourceURL, url).href, accept).then((dataURL) => {
        css = css.replace(resourceURL, dataURL)
      })
    )
  }

  await Promise.all(promises)
  return css
}
