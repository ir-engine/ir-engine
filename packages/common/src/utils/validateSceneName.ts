export default function isValidSceneName(sceneName: string) {
  return sceneName.length >= 3 && sceneName.length <= 64 && sceneName.indexOf('_') === -1
}
