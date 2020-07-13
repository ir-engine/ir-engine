import { BufferedComponent, RingBuffer } from "armada"

interface PropTypes {
  values: RingBuffer<Transition>
}

export default class Transition extends BufferedComponent<PropTypes, Transition> {}
