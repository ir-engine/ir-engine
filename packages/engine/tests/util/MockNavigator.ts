export class MockNavigator {
  getGamepads = (): (Gamepad | null)[] => {
    const ret: null[] = [null]
    return ret
  }
}
