import { MockEventListener } from './MockEventListener'

export class MockWindow extends MockEventListener {
  innerWidth = 1280
  innerHeight = 720
}
