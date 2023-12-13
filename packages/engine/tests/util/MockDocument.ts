import { MockEventListener } from './MockEventListener'

export class MockDocument extends MockEventListener {
  visibilityState = 'hidden'
}
