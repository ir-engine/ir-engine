const namePattern = new RegExp('(.*) \\d+$')

function getNameWithoutIndex(name) {
  let cacheName = name
  const match = namePattern.exec(name)
  if (match) {
    cacheName = match[1]
  }
  return cacheName
}

export default function makeUniqueName(scene, object) {
  let counter = 0
  const nameWithoutIndex = getNameWithoutIndex(object.name)

  scene.traverse((child) => {
    if (!child.isNode) return

    if (child === object) return

    if (!child.name.startsWith(nameWithoutIndex)) return

    const parts = child.name.split(nameWithoutIndex)

    if (parts[0]) return // if child's name starts with given object's name then first part will be empty string ('')

    // Second part of the name will be empty string ('') for first child which name does not have '1' suffix
    const num = parts[1] ? parseInt(parts[1]) : 1

    if (num > counter) {
      counter = num
    }
  })

  object.name = nameWithoutIndex + (counter > 0 ? ' ' + (counter + 1) : '')
}
