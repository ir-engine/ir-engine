export default function () {
  // @ts-ignore
  return import.meta.glob('../i18n/**/*.json', { eager: true })
}
