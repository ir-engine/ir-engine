var mappings = {
    mappings: {
        default: {
            common: {
                trackpaddown: 'teleportstart',
                trackpadup: 'teleportend',
                // triggerdown: 'teleportstart',
                // triggerup: 'teleportend'
            },
            'daydream-controls': {
                trackpaddown: 'teleportstart',
                trackpadup: 'teleportend'
            },
            'vive-controls': {
                'trackpad.down': 'teleportstart',
                'trackpad.up': 'teleportend'
            },
            'oculus-touch-controls': {
                // triggerdown: 'teleportstart',
                // triggerup: 'teleportend',
                'bbuttonup': 'cyclehud',
                'abuttonup': 'cyclehud',
            },
            'windows-motion-controls': {
                'grip.down': 'teleportstart',
                'grip.up': 'teleportend',
                'menu.up': 'cyclehud'
            },
            "gearvr-controls": {
                trackpaddown: "teleportstart",
                trackpadup: "teleportend"
            },
            "oculus-go-controls": {
                trackpaddown: "teleportstart",
                trackpadup: "teleportend"
            }
        }
    }
};

 // To be exposed by the application
 var inputActions = {
     default: {
      teleportstart: { label: 'Start teleport' },
      teleportend: { label: 'End teleport' }
     }
  };


export {mappings, inputActions};