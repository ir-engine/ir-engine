// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'

export const ComponentName = 'clickable'

export interface ClickableData {
  id?: string
  enabled?: boolean
  clickevent?: string
  enableevent?: string
  disableevent?: string
}

export const ClickableComponentSchema: AFRAME.MultiPropertySchema<ClickableData> = {
  id: { type: 'string', default: '' },
  enabled: { type: 'boolean', default: true },
  clickevent: { type: 'string', default: 'cellclicked' },
  enableevent: { type: 'string', default: 'enable-clickable' },
  disableevent: { type: 'string', default: 'disable-clickable' }
}

export interface ClickableProps {
  clickHandler: () => void,
  raycasterIntersectedHandler: (e: any) => void,
  raycasterIntersectedClearedHandler: () => void,
  addHandlers: () => void,
  removeHandlers: () => void,
  firstUpdate: boolean,
  intersectingRaycaster: any,
  intersection: any
}

export const ClickableComponent: AFRAME.ComponentDefinition<ClickableProps> = {
  schema: ClickableComponentSchema,
  data: {
  } as ClickableData,

  intersectingRaycaster: null,
  intersection: null,
  firstUpdate: true,

  init() {
  },

  tick: function() {
    if (!this.intersectingRaycaster) {
      return
    }

    const intersection = this.intersectingRaycaster.getIntersection(this.el)
    this.intersection = intersection
  },

  update(oldData) {
    var self = this
    var data = self.data
    var changedData = Object.keys(self.data).filter(x => self.data[x] !== oldData[x])

    if (this.firstUpdate) {
      this.firstUpdate = false
      return
    }
    if (changedData.includes('enabled')) {
      if (data.enabled) {
        this.addHandlers()
      } else {
        this.removeHandlers()
      }
    }
  },

  remove() {
    this.removeHandlers()
  },

  play() {
    if (this.data.enabled) {
      this.addHandlers()
    }
  },

  pause() {
    if (this.data.enabled) {
      this.removeHandlers()
    }
  },

  clickHandler() {
    if (this.intersectingRaycaster) {
      const intersection = this.intersectingRaycaster.getIntersection(this.el)
      if (intersection) {
        var clickEvent = new Event(this.data.clickevent, { bubbles: true })
        this.el.dispatchEvent(clickEvent)
      }
    }
  },

  raycasterIntersectedHandler(evt) {
    this.intersectingRaycaster = evt.detail.el.components.raycaster
  },

  raycasterIntersectedClearedHandler() {
    if (this.intersectingRaycaster != null) {
      const intersection = this.intersectingRaycaster.getIntersection(this.el)
      if (intersection === undefined) {
        this.intersectingRaycaster = null
      } else {
        // console.log('intersecting:')
        // console.log(intersection.object.name);
      }
    } else {
      // console.log('self.intersectingRaycaster is null')
    }
  },

  addHandlers: function() {
    this.el.addEventListener('click', this.clickHandler.bind(this))
    this.el.addEventListener('raycaster-intersected', this.raycasterIntersectedHandler.bind(this))
    this.el.addEventListener('raycaster-intersected-cleared', this.raycasterIntersectedClearedHandler.bind(this))
  },

  removeHandlers: function() {
    this.el.removeEventListener('click', this.clickHandler)
    this.el.removeEventListener('raycaster-intersected', this.raycasterIntersectedHandler)
    this.el.removeEventListener('raycaster-intersected-cleared', this.raycasterIntersectedClearedHandler)
  }

}

const ComponentSystem = {
  name: ComponentName,
  component: ClickableComponent
}

export default ComponentSystem
