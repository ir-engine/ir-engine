import { addComponent, getComponent, removeEntity } from '../functions/EntityFunctions';
import { Engine } from './Engine';

export class Entity {
  /**
   * Unique ID for this instance
   */
  id: number

  /**
   * List of component types currently attached to the entity
   */
  componentTypes = []

  /**
   * List of components attached to the entity
   */
  components = {}

  /**
   * Unique ID for this instance
   */
  componentTypesToRemove: any[] = []
  /**
   * List of components to remove this frame from the entity
   */
  componentsToRemove: {} = {}

  /**
   * Queries this entity is part of
   */
  queries: any[] = []

  /**
   * Keep count of our state components for handling entity removal
   * System state components live on the entity until the entity is deleted
   */
  numStateComponents = 0

  /**
   * Constructor is called when component created
   * (Since addComponent pulls from the pool, it doesn't invoke constructor)
   */
  constructor () {
    // Unique ID for this entity
    this.id = Engine.nextEntityId++;
    this.componentTypes = [];
    this.components = {};
    this.componentsToRemove = {};
    this.queries = [];
    this.componentTypesToRemove = [];
    this.numStateComponents = 0;
  }

  /**
   * Default logic for copying entity
   * @returns this new entity as a copy of the source
   */
  copy (src: Entity): Entity {
    for (const componentId in src.components) {
      const srcComponent = src.components[componentId];
      addComponent(this, srcComponent.constructor);
      const component = getComponent(this, srcComponent.constructor);
      component.copy(srcComponent);
    }
    return this;
  }

  /**
   * Default logic for clone entity
   * @returns new entity as a clone of the source
   */
  clone (): Entity {
    return new Entity().copy(this);
  }

  /**
   * Reset the entity
   * Caled when entity is returned to pool
   */
  reset (): void {
    this.id = Engine.nextEntityId++;
    this.componentTypes.length = 0;
    this.queries.length = 0;

    for (const componentId in this.components) {
      delete this.components[componentId];
    }
  }

  /**
   * Remove entity
   * Permanently destroys entity and removes from pool
   * Along with all components
   */
  remove (forceImmediate?: boolean): void {
    return removeEntity(this, forceImmediate);
  }
}
