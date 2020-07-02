const mappings = {
  mappings: {
    default: {
      common: {
        // trackpaddown: 'some-event',
        // trackpadup: 'some-event'
        // triggerdown: 'some-event',
        // triggerup: 'some-event'
      },
      'daydream-controls': {
        // trackpaddown: 'some-event',
        // trackpadup: 'some-event'
      },
      'vive-controls': {
        // 'trackpad.down': 'some-event',
        // 'trackpad.up': 'some-event'
      },
      'oculus-touch-controls': {
        // triggerdown: 'some-event',
        // triggerup: 'some-event',
        // bbuttonup: 'some-event',
        abuttonup: 'toggle-menu',
        xbuttonup: 'toggle-menu'
      },
      'windows-motion-controls': {
        // 'grip.down': 'some-event',
        // 'grip.up': 'some-event',
        // 'menu.up': 'cyclehud'
      },
      'gearvr-controls': {
        // trackpaddown: 'some-event',
        // trackpadup: 'some-event'
      },
      'oculus-go-controls': {
        // trackpaddown: 'some-event',
        // trackpadup: 'some-event'
      }
    }
  }
}

// To be exposed by the application
const inputActions = {
  default: {
    someEvent: { label: 'trigger event' }
  }
}

export { mappings, inputActions }