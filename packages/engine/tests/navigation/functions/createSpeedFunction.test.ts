import assert from 'assert'
import createSpeedFunction from '../../../src/navigation/functions/createSpeedFunction'

describe.only("createSpeedFunction", () => {
  it("returns an impure function that returns on each call a speed that increases to a point, then decreases", () => {
    const max = 3.6
    const accel = 1.2
    const damp = 0.1
    const fn = createSpeedFunction(max, accel, damp)
    const initialDistanceFromEnd = 200
    let distanceFromEnd = initialDistanceFromEnd
    let speed = NaN
    let actualMax = 0
    let maximaCount = 0
    let trail = [NaN, NaN, NaN]
    while(distanceFromEnd > 0) {
      speed = fn(distanceFromEnd)
      assert(speed > 0, "speed is always positive while there's some distance left to travel")
      distanceFromEnd -= speed
      actualMax = Math.max(speed, actualMax)
      if(trail[0] < trail[1] && trail[1] > trail[2])
        maximaCount++
      if(trail[0] !== speed) {
        if(trail[1] !== trail[0]) {
          if(trail[2] !== trail[1]) {
            trail[2] = trail[1]
          }
          trail[1] = trail[0]
        }
        trail[0] = speed
      }
    }
    assert.equal(maximaCount, 1, "speed peeks only once")
    assert.equal(actualMax, max, "it reaches max speed at some point, given enough distance")
    assert.equal(distanceFromEnd, 0, "it stops precisely at the end")
    speed = fn(distanceFromEnd)
    assert.equal(speed, 0, "when at the end, speed is zero")
  })

  it("applies damping even if distance from end is constant to minimize orbiting", () => {
    const fn = createSpeedFunction(5, 1, 0.1)
    assert(fn(1) > fn(1))
  })
})
