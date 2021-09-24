export default function (packName) {
  return import(`./${packName}/index.ts`)
}
