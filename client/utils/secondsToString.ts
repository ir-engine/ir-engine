// TODO: write unit test for these functions
function padTime(t) {
  if (t < 10) {
    return '0' + t
  }
  return t
}
function secondsToString(seconds) {
  const hrs = Math.floor(((seconds % 31536000) % 86400) / 3600)
  const mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)
  const secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60)
  return (hrs >= 1 ? (padTime(hrs) + ':') : '') + padTime(mins) + ':' + padTime(secs)
}

export default secondsToString
