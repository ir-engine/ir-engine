export const prepareReportIssue = () => {
  const oldLog = console.log
  const log = {
    logs: [] as String[]
  }
  console.log = function (message) {
    log.logs.push(message)
    oldLog.apply(console, arguments)
  }
}
