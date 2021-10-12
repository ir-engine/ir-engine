import Bugsnag from '@bugsnag/browser'
import BugsnagPluginReact from '@bugsnag/plugin-react'

Bugsnag.start({
  /*apiKey: window.bugsnagKey,*/
  apiKey: 'c10b95290070cb8888a7a79cc5408555',
  appVersion: window.bbgmVersion,
  autoTrackSessions: false,
  onError: function (event) {
    // Normalize league URLs to all look the same
    if (event && typeof event.context === 'string') {
      event.context = event.context.replace(/^\/l\/[0-9]+?\//, '/l/0/')
    }
  },
  enabledReleaseStages: ['beta', 'production'],
  plugins: [new BugsnagPluginReact()],
  releaseStage: window.releaseStage
})
