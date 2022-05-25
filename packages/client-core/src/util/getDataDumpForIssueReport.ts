declare global {
  interface Console {
    everything: any
  }
}

export function getDataDumpForIssueReport() {
  if (console.everything === undefined) {
    console.everything = []
    window.onerror = function (error, url, line) {
      console.everything.push({
        type: 'exception',
        value: { error, url, line }
      })
      return false
    }

    function hookLogType(logType) {
      const original = console[logType].bind(console)
      return function () {
        console.everything.push({
          type: logType,
          value: Array.from(arguments)
        })
        original.apply(console, arguments)
      }
    }

    ;['log', 'error', 'warn', 'debug'].forEach((logType) => {
      console[logType] = hookLogType(logType)
    })
  }
  // Take screen shot

  return {
    logs: console.everything,
    userAgent: navigator.userAgent
  }
}