import { transform } from '@svgr/core'
import fs from 'fs/promises'
import iconaJson from './icona.json'

function transformName(name: string) {
  const parts = name.replaceAll('-', '_').split('_')
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

async function run() {
  const dirExists = await fs
    .opendir('./src/icons/files')
    .then((dir) => {
      const result = !!dir.readSync()
      dir.closeSync()
      return result
    })
    .catch(() => false)

  if (dirExists) {
    console.log('icons/files already exists, deleting old directory and creating new one')
    await fs.rm('./src/icons/files', { recursive: true })
    await fs.mkdir('./src/icons/files')
  } else {
    await fs.mkdir('./src/icons/files')
    console.log('created icons/files')
  }

  const transformPromises = Object.values(iconaJson).map(async (iconEntry) => {
    const componentName = transformName(iconEntry.name)
    const reactComponent = await transform(
      iconEntry.svg,
      {
        icon: true,
        dimensions: true,
        typescript: true,
        ref: true,
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx']
      },
      { componentName }
    )
    await fs.writeFile('./src/icons/files/' + componentName + '.tsx', reactComponent)

    return componentName
  })

  const componentNames = await Promise.all(transformPromises)

  const componentNamesExports = componentNames
    .toSorted()
    .map((componentName) => `export { default as ${componentName} } from './files/${componentName}'`)
    .join('\n')
  await fs.writeFile('./src/icons/index.ts', componentNamesExports)

  console.log(`completed writing ${transformPromises.length} files and generated index.ts`)
}

run()
