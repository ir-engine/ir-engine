import { Component, Types } from 'ecsy';

class ComponentA extends Component<any> {}

ComponentA.schema = {
  number: { type: Types.Number, default: 10 },
  string: { type: Types.String, default: "Hello" }
}
