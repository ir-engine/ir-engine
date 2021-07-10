const padTime = (t: number): string => (t < 10 ? `0${t}` : `${t}`)

const secondsToString = (seconds: number): string => {
  const hrs = Math.floor(((seconds % 31536000) % 86400) / 3600)
  const mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)
  const secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60)
  return `${padTime(hrs)}:${padTime(mins)}:${padTime(secs)}`
}

export default secondsToString
