import matches from 'ts-matches'

const matchesNumberArray = matches.arrayOf(matches.number)

export const matchPose = matches.guard((v): v is Pose => {
  if (!Array.isArray(v)) return false
  if (!matchesNumberArray.test(v)) return false
  if (v.length === 7) return true
  return false
})
export type Pose = [number, number, number, number, number, number, number]
