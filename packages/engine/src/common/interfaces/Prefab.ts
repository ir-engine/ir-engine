import { BehaviorValue } from './BehaviorValue';

// Prefab is a pattern for creating an entity and component collection as a prototype
export interface Prefab {
  localClientComponents?: Array<{
    type: any;
    data?: any;
  }>;
  onBeforeCreate?: BehaviorValue[];
  onAfterCreate?: BehaviorValue[];
  onBeforeDestroy?: BehaviorValue[];
  onAfterDestroy?: BehaviorValue[];
}
