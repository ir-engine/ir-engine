export default class AvatarSchema {
  template: string

  constructor(templateID = 'avatar-template', public components = defaultComponents) {
    this.template = '#' + templateID
  }

  addComponent(component: AvatarSchemaComponent) {
    this.components.push(component)
  }
}

export class AvatarSchemaComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor(public component = 'position', public selector?: string) {
  }
}

export const defaultComponents: AvatarSchemaComponent[] = [
  new AvatarSchemaComponent('position'),
  new AvatarSchemaComponent('rotation'),
  new AvatarSchemaComponent('position', '.camera-rig'),
  new AvatarSchemaComponent('rotation', '.camera-rig'),
  new AvatarSchemaComponent('position', '.player-camera'),
  new AvatarSchemaComponent('rotation', '.player-camera')
]
