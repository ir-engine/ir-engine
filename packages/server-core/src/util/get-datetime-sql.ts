// https://stackoverflow.com/a/11150727
export const getDateTimeSql = async () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
