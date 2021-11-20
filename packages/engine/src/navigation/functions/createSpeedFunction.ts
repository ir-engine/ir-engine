function findStoppingDistance(speed: number, damp: number) {
  // TODO find the right equation for this
  if (isFinite(speed) && damp > 0) {
    let result = 0
    while (speed > 0) {
      speed -= damp
      result += speed
    }
    return result
  }
  return Infinity
}

export default function createSpeedFunction(max: number, accel: number, damp: number) {
  let speed = 0
  return function speedFunction(distanceFromEnd: number) {
    const stoppingDist = findStoppingDistance(speed, damp)
    if (distanceFromEnd > 0) {
      if (distanceFromEnd > speed) {
        speed -= damp
      } else {
        speed = distanceFromEnd
      }
      if (distanceFromEnd > stoppingDist) {
        speed = Math.min(max, speed + accel)
      }
    } else {
      speed = 0
    }
    return speed
  }
}
