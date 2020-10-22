import { BehaviorValue } from './BehaviorValue';

// Prefab is a pattern for creating an entity and component collection as a prototype
export interface Prefab {
  components?: Array<{
    type: any;
    data?: any;
  }>;
  onCreate?: BehaviorValue[];
  onAfterCreate?: BehaviorValue[];
  onDestroy?: BehaviorValue[];
}
