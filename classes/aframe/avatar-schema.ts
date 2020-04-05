export default class AvatarSchema {
  template: string

  constructor(templateID = 'avatar-template', public components = defaultComponents) {
    this.template = '#' + templateID
  }

  addComponent(component: AvatarSchemaComponent) {
    this.components.push(component)
  }

// TODO : removeComponent
// removeComponent(component: AvatarSchemaComponent) {
// }
}

export class AvatarSchemaComponent {
  constructor(public component = 'position') {
  }
}

export const defaultComponents: AvatarSchemaComponent[] = [
  new AvatarSchemaComponent('position'),
  new AvatarSchemaComponent('rotation'),
]
