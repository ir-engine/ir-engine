export function getOS() {
  const platform = process.platform

  if (platform.includes('darwin')) {
    return 'macOS'
  } else if (platform.includes('win32')) {
    return 'Windows'
  } else if (platform.includes('linux')) {
    return 'Linux'
  }
  return 'other'
}
