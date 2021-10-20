const isAbsolute = new RegExp(`(?:^[a-z][a-z0-9+.-]*:|\/\/)`)
export const isAbsolutePath = (path) => {
  return isAbsolute.test(path)
}
