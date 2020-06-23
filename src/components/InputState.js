export class InputState extends Component {
  constructor() {
      super()
      this.states = {}
      this.changed = true
      this.released = false
  }

  anyChanged() {
      return this.changed
  }

  anyReleased() {
      return this.released
  }
}
