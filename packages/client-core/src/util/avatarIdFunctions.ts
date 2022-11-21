export const AVATAR_CHARACTERS = '123456789abcdef'
export const AVATAR_ID_REGEX = /\/([a-fA-F0-9]+).glb$/

export const generateAvatarId = () => {
  let id = ''
  for (let i = 0; i < 24; i++) id += AVATAR_CHARACTERS.charAt(Math.floor(Math.random() * AVATAR_CHARACTERS.length))
  return id
}
