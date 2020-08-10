const parseValue = (x, self, ...args) => (typeof x === "function" ? x(self, ...args) : x)

export function createKeyframes(options, startTime) {
  options = {
    parts: {},
    duration: 1,
    direction: "forward",
    loopCount: -1,
    ...options
  }

  const keyframes = {
    duration: parseValue(options.duration, options),
    loopCount: parseValue(options.loopCount, options),
    direction: parseValue(options.direction, options),
    options,
    startTime,
    currentLoop: -1
  }

  return keyframes
}

export function syncKeyframes(keyframes, time) {
  const elapsed = time - keyframes.startTime
  const baseTime = elapsed % keyframes.duration
  const numLoops = Math.floor(elapsed / keyframes.duration)

  if (keyframes.loopCount < 0 || numLoops < keyframes.loopCount) {
    if (keyframes.currentLoop !== numLoops) {
      keyframes.currentLoop = numLoops
      keyframes.frames = generateFrames(null, keyframes)
    }
  }
}

function generateFrames(object, keyframes) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const part of keyframes.options.parts) {
    console.log("nothing here yet")
  }
}
