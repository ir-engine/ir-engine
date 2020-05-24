import AFRAME from 'aframe'

export const ComponentName = 'clickable'

export interface ClickableData {
  id?: string
  enabled?: boolean
  clickevent?: string
  clickeventData?: string,
  enableevent?: string
  disableevent?: string
}

export const ClickableComponentSchema: AFRAME.MultiPropertySchema<ClickableData> = {
  id: { type: 'string', default: '' },
  enabled: { type: 'boolean', default: true },
  clickevent: { type: 'string', default: 'cellclicked' },
  clickeventData: { type: 'string', default: '' },
  enableevent: { type: 'string', default: 'enable-clickable' },
  disableevent: { type: 'string', default: 'disable-clickable' }
}

export interface Props {
  clickHandler: () => void,
  raycasterIntersectedHandler: (e: any) => void,
  raycasterIntersectedClearedHandler: () => void,
  addHandlers: () => void,
  removeHandlers: () => void,
  firstUpdate: boolean,
  intersectingRaycaster: any,
  intersection: any,
  beganClickableClass: boolean
}

export const ClickableComponent: AFRAME.ComponentDefinition<Props> = {
  schema: ClickableComponentSchema,
  data: {
  } as ClickableData,

  intersectingRaycaster: null,
  intersection: null,
  firstUpdate: true,
  beganClickableClass: false,

  init() {
    this.beganClickableClass = this.el.classList.contains('clickable')
    this.el.classList.add('clickable')
  },

  tick: function () {
    if (!this.intersectingRaycaster) {
      return
    }

    const intersection = this.intersectingRaycaster.getIntersection(this.el)
    this.intersection = intersection
  },

  update(oldData) {
    const self = this
    const data = self.data
    const changedData = Object.keys(self.data).filter(x => self.data[x] !== oldData[x])

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
    if (!this.beganClickableClass) {
      this.el.classList.remove('clickable')
    }
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
        // CustomEvent allows passing data through 'detail' property.
        const clickEvent = new CustomEvent(this.data.clickevent,
          {
            bubbles: true,
            ...(this.data.clickeventData ? { detail: JSON.parse(this.data.clickeventData) } : {})
          }
        )
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

  addHandlers: function () {
    this.el.addEventListener('click', this.clickHandler.bind(this))
    this.el.addEventListener('raycaster-intersected', this.raycasterIntersectedHandler.bind(this))
    this.el.addEventListener('raycaster-intersected-cleared', this.raycasterIntersectedClearedHandler.bind(this))
  },

  removeHandlers: function () {
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
