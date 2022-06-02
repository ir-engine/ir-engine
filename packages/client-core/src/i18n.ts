export default function () {
  // @ts-ignore
  return import.meta.globEager('../i18n/**/*.json')
}
