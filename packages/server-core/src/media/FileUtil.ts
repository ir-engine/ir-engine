import fs from 'fs'
import path from 'path'

export const copyRecursiveSync = function (src: string, dest: string): void {
  if (!fs.existsSync(src)) return

  if (fs.lstatSync(src).isDirectory()) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

export const getIncrementalName = function (name: string, parentPath: string): string {
  let filename = name
  const _path = path.join(parentPath, name)

  if (!fs.existsSync(_path)) return filename

  let count = 1

  if (fs.lstatSync(_path).isDirectory()) {
    do {
      filename = `${name}(${count})`
      count++
    } while (fs.existsSync(path.join(parentPath, filename)))
  } else {
    const extension = path.extname(name)
    const baseName = path.basename(name, extension)

    do {
      filename = `${baseName}(${count})${extension}`
      count++
    } while (fs.existsSync(path.join(parentPath, filename)))
  }

  return filename
}
