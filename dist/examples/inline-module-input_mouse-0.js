/**
 * Return the name of a component
 * @param {Component} Component
 * @private
 */
function getName(Component) {
  return Component.name;
}

/**
 * Return a valid property name for the Component
 * @param {Component} Component
 * @private
 */
function componentPropertyName(Component) {
  return getName(Component);
}

/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */
function queryKey(Components) {
  var names = [];
  for (var n = 0; n < Components.length; n++) {
    var T = Components[n];
    if (typeof T === "object") {
      var operator = T.operator === "not" ? "!" : T.operator;
      names.push(operator + getName(T.Component));
    } else {
      names.push(getName(T));
    }
  }

  return names.sort().join("-");
}

// Detector for browser's "window"
const hasWindow = typeof window !== "undefined";

// performance.now() "polyfill"
const now =
  hasWindow && typeof window.performance !== "undefined"
    ? performance.now.bind(performance)
    : Date.now.bind(Date);

class SystemManager {
  constructor(world) {
    this._systems = [];
    this._executeSystems = []; // Systems that have `execute` method
    this.world = world;
    this.lastExecutedSystem = null;
  }

  registerSystem(SystemClass, attributes) {
    if (!SystemClass.isSystem) {
      throw new Error(
        `System '${SystemClass.name}' does not extend 'System' class`
      );
    }

    if (this.getSystem(SystemClass) !== undefined) {
      console.warn(`System '${SystemClass.name}' already registered.`);
      return this;
    }

    var system = new SystemClass(this.world, attributes);
    if (system.init) system.init(attributes);
    system.order = this._systems.length;
    this._systems.push(system);
    if (system.execute) {
      this._executeSystems.push(system);
      this.sortSystems();
    }
    return this;
  }

  unregisterSystem(SystemClass) {
    let system = this.getSystem(SystemClass);
    if (system === undefined) {
      console.warn(
        `Can unregister system '${SystemClass.name}'. It doesn't exist.`
      );
      return this;
    }

    this._systems.splice(this._systems.indexOf(system), 1);

    if (system.execute) {
      this._executeSystems.splice(this._executeSystems.indexOf(system), 1);
    }

    // @todo Add system.unregister() call to free resources
    return this;
  }

  sortSystems() {
    this._executeSystems.sort((a, b) => {
      return a.priority - b.priority || a.order - b.order;
    });
  }

  getSystem(SystemClass) {
    return this._systems.find(s => s instanceof SystemClass);
  }

  getSystems() {
    return this._systems;
  }

  removeSystem(SystemClass) {
    var index = this._systems.indexOf(SystemClass);
    if (!~index) return;

    this._systems.splice(index, 1);
  }

  executeSystem(system, delta, time) {
    if (system.initialized) {
      if (system.canExecute()) {
        let startTime = now();
        system.execute(delta, time);
        system.executeTime = now() - startTime;
        this.lastExecutedSystem = system;
        system.clearEvents();
      }
    }
  }

  stop() {
    this._executeSystems.forEach(system => system.stop());
  }

  execute(delta, time, forcePlay) {
    this._executeSystems.forEach(
      system =>
        (forcePlay || system.enabled) && this.executeSystem(system, delta, time)
    );
  }

  stats() {
    var stats = {
      numSystems: this._systems.length,
      systems: {}
    };

    for (var i = 0; i < this._systems.length; i++) {
      var system = this._systems[i];
      var systemStats = (stats.systems[system.constructor.name] = {
        queries: {},
        executeTime: system.executeTime
      });
      for (var name in system.ctx) {
        systemStats.queries[name] = system.ctx[name].stats();
      }
    }

    return stats;
  }
}

class ObjectPool {
  // @todo Add initial size
  constructor(T, initialSize) {
    this.freeList = [];
    this.count = 0;
    this.T = T;
    this.isObjectPool = true;

    if (typeof initialSize !== "undefined") {
      this.expand(initialSize);
    }
  }

  acquire() {
    // Grow the list by 20%ish if we're out
    if (this.freeList.length <= 0) {
      this.expand(Math.round(this.count * 0.2) + 1);
    }

    var item = this.freeList.pop();

    return item;
  }

  release(item) {
    item.reset();
    this.freeList.push(item);
  }

  expand(count) {
    for (var n = 0; n < count; n++) {
      var clone = new this.T();
      clone._pool = this;
      this.freeList.push(clone);
    }
    this.count += count;
  }

  totalSize() {
    return this.count;
  }

  totalFree() {
    return this.freeList.length;
  }

  totalUsed() {
    return this.count - this.freeList.length;
  }
}

/**
 * @private
 * @class EventDispatcher
 */
class EventDispatcher {
  constructor() {
    this._listeners = {};
    this.stats = {
      fired: 0,
      handled: 0
    };
  }

  /**
   * Add an event listener
   * @param {String} eventName Name of the event to listen
   * @param {Function} listener Callback to trigger when the event is fired
   */
  addEventListener(eventName, listener) {
    let listeners = this._listeners;
    if (listeners[eventName] === undefined) {
      listeners[eventName] = [];
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener);
    }
  }

  /**
   * Check if an event listener is already added to the list of listeners
   * @param {String} eventName Name of the event to check
   * @param {Function} listener Callback for the specified event
   */
  hasEventListener(eventName, listener) {
    return (
      this._listeners[eventName] !== undefined &&
      this._listeners[eventName].indexOf(listener) !== -1
    );
  }

  /**
   * Remove an event listener
   * @param {String} eventName Name of the event to remove
   * @param {Function} listener Callback for the specified event
   */
  removeEventListener(eventName, listener) {
    var listenerArray = this._listeners[eventName];
    if (listenerArray !== undefined) {
      var index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  /**
   * Dispatch an event
   * @param {String} eventName Name of the event to dispatch
   * @param {Entity} entity (Optional) Entity to emit
   * @param {Component} component
   */
  dispatchEvent(eventName, entity, component) {
    this.stats.fired++;

    var listenerArray = this._listeners[eventName];
    if (listenerArray !== undefined) {
      var array = listenerArray.slice(0);

      for (var i = 0; i < array.length; i++) {
        array[i].call(this, entity, component);
      }
    }
  }

  /**
   * Reset stats counters
   */
  resetCounters() {
    this.stats.fired = this.stats.handled = 0;
  }
}

class Query {
  /**
   * @param {Array(Component)} Components List of types of components to query
   */
  constructor(Components, manager) {
    this.Components = [];
    this.NotComponents = [];

    Components.forEach(component => {
      if (typeof component === "object") {
        this.NotComponents.push(component.Component);
      } else {
        this.Components.push(component);
      }
    });

    if (this.Components.length === 0) {
      throw new Error("Can't create a query without components");
    }

    this.entities = [];

    this.eventDispatcher = new EventDispatcher();

    // This query is being used by a reactive system
    this.reactive = false;

    this.key = queryKey(Components);

    // Fill the query with the existing entities
    for (var i = 0; i < manager._entities.length; i++) {
      var entity = manager._entities[i];
      if (this.match(entity)) {
        // @todo ??? this.addEntity(entity); => preventing the event to be generated
        entity.queries.push(this);
        this.entities.push(entity);
      }
    }
  }

  /**
   * Add entity to this query
   * @param {Entity} entity
   */
  addEntity(entity) {
    entity.queries.push(this);
    this.entities.push(entity);

    this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED, entity);
  }

  /**
   * Remove entity from this query
   * @param {Entity} entity
   */
  removeEntity(entity) {
    let index = this.entities.indexOf(entity);
    if (~index) {
      this.entities.splice(index, 1);

      index = entity.queries.indexOf(this);
      entity.queries.splice(index, 1);

      this.eventDispatcher.dispatchEvent(
        Query.prototype.ENTITY_REMOVED,
        entity
      );
    }
  }

  match(entity) {
    return (
      entity.hasAllComponents(this.Components) &&
      !entity.hasAnyComponents(this.NotComponents)
    );
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.Components.map(C => C.name),
        not: this.NotComponents.map(C => C.name)
      },
      numEntities: this.entities.length
    };
  }

  /**
   * Return stats for this query
   */
  stats() {
    return {
      numComponents: this.Components.length,
      numEntities: this.entities.length
    };
  }
}

Query.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
Query.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
Query.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";

/**
 * @private
 * @class QueryManager
 */
class QueryManager {
  constructor(world) {
    this._world = world;

    // Queries indexed by a unique identifier for the components it has
    this._queries = {};
  }

  onEntityRemoved(entity) {
    for (var queryName in this._queries) {
      var query = this._queries[queryName];
      if (entity.queries.indexOf(query) !== -1) {
        query.removeEntity(entity);
      }
    }
  }

  /**
   * Callback when a component is added to an entity
   * @param {Entity} entity Entity that just got the new component
   * @param {Component} Component Component added to the entity
   */
  onEntityComponentAdded(entity, Component) {
    // @todo Use bitmask for checking components?

    // Check each indexed query to see if we need to add this entity to the list
    for (var queryName in this._queries) {
      var query = this._queries[queryName];

      if (
        !!~query.NotComponents.indexOf(Component) &&
        ~query.entities.indexOf(entity)
      ) {
        query.removeEntity(entity);
        continue;
      }

      // Add the entity only if:
      // Component is in the query
      // and Entity has ALL the components of the query
      // and Entity is not already in the query
      if (
        !~query.Components.indexOf(Component) ||
        !query.match(entity) ||
        ~query.entities.indexOf(entity)
      )
        continue;

      query.addEntity(entity);
    }
  }

  /**
   * Callback when a component is removed from an entity
   * @param {Entity} entity Entity to remove the component from
   * @param {Component} Component Component to remove from the entity
   */
  onEntityComponentRemoved(entity, Component) {
    for (var queryName in this._queries) {
      var query = this._queries[queryName];

      if (
        !!~query.NotComponents.indexOf(Component) &&
        !~query.entities.indexOf(entity) &&
        query.match(entity)
      ) {
        query.addEntity(entity);
        continue;
      }

      if (
        !!~query.Components.indexOf(Component) &&
        !!~query.entities.indexOf(entity) &&
        !query.match(entity)
      ) {
        query.removeEntity(entity);
        continue;
      }
    }
  }

  /**
   * Get a query for the specified components
   * @param {Component} Components Components that the query should have
   */
  getQuery(Components) {
    var key = queryKey(Components);
    var query = this._queries[key];
    if (!query) {
      this._queries[key] = query = new Query(Components, this._world);
    }
    return query;
  }

  /**
   * Return some stats from this class
   */
  stats() {
    var stats = {};
    for (var queryName in this._queries) {
      stats[queryName] = this._queries[queryName].stats();
    }
    return stats;
  }
}

class Component {
  constructor(props) {
    if (props !== false) {
      const schema = this.constructor.schema;

      for (const key in schema) {
        if (props && props.hasOwnProperty(key)) {
          this[key] = props[key];
        } else {
          const schemaProp = schema[key];
          if (schemaProp.hasOwnProperty("default")) {
            this[key] = schemaProp.type.clone(schemaProp.default);
          } else {
            const type = schemaProp.type;
            this[key] = type.clone(type.default);
          }
        }
      }
    }

    this._pool = null;
  }

  copy(source) {
    const schema = this.constructor.schema;

    for (const key in schema) {
      const prop = schema[key];

      if (source.hasOwnProperty(key)) {
        this[key] = prop.type.copy(source[key], this[key]);
      }
    }

    return this;
  }

  clone() {
    return new this.constructor().copy(this);
  }

  reset() {
    const schema = this.constructor.schema;

    for (const key in schema) {
      const schemaProp = schema[key];

      if (schemaProp.hasOwnProperty("default")) {
        this[key] = schemaProp.type.copy(schemaProp.default, this[key]);
      } else {
        const type = schemaProp.type;
        this[key] = type.copy(type.default, this[key]);
      }
    }
  }

  dispose() {
    if (this._pool) {
      this._pool.release(this);
    }
  }
}

Component.schema = {};
Component.isComponent = true;

class SystemStateComponent extends Component {}

SystemStateComponent.isSystemStateComponent = true;

class EntityPool extends ObjectPool {
  constructor(entityManager, entityClass, initialSize) {
    super(entityClass, undefined);
    this.entityManager = entityManager;

    if (typeof initialSize !== "undefined") {
      this.expand(initialSize);
    }
  }

  expand(count) {
    for (var n = 0; n < count; n++) {
      var clone = new this.T(this.entityManager);
      clone._pool = this;
      this.freeList.push(clone);
    }
    this.count += count;
  }
}

/**
 * @private
 * @class EntityManager
 */
class EntityManager {
  constructor(world) {
    this.world = world;
    this.componentsManager = world.componentsManager;

    // All the entities in this instance
    this._entities = [];
    this._nextEntityId = 0;

    this._entitiesByNames = {};

    this._queryManager = new QueryManager(this);
    this.eventDispatcher = new EventDispatcher();
    this._entityPool = new EntityPool(
      this,
      this.world.options.entityClass,
      this.world.options.entityPoolSize
    );

    // Deferred deletion
    this.entitiesWithComponentsToRemove = [];
    this.entitiesToRemove = [];
    this.deferredRemovalEnabled = true;
  }

  getEntityByName(name) {
    return this._entitiesByNames[name];
  }

  /**
   * Create a new entity
   */
  createEntity(name) {
    var entity = this._entityPool.acquire();
    entity.alive = true;
    entity.name = name || "";
    if (name) {
      if (this._entitiesByNames[name]) {
        console.warn(`Entity name '${name}' already exist`);
      } else {
        this._entitiesByNames[name] = entity;
      }
    }

    this._entities.push(entity);
    this.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity);
    return entity;
  }

  // COMPONENTS

  /**
   * Add a component to an entity
   * @param {Entity} entity Entity where the component will be added
   * @param {Component} Component Component to be added to the entity
   * @param {Object} values Optional values to replace the default attributes
   */
  entityAddComponent(entity, Component, values) {
    if (!this.world.componentsManager.Components[Component.name]) {
      throw new Error(
        `Attempted to add unregistered component "${Component.name}"`
      );
    }

    if (~entity._ComponentTypes.indexOf(Component)) {
      // @todo Just on debug mode
      console.warn(
        "Component type already exists on entity.",
        entity,
        Component.name
      );
      return;
    }

    entity._ComponentTypes.push(Component);

    if (Component.__proto__ === SystemStateComponent) {
      entity.numStateComponents++;
    }

    var componentPool = this.world.componentsManager.getComponentsPool(
      Component
    );

    var component = componentPool
      ? componentPool.acquire()
      : new Component(values);

    if (componentPool && values) {
      component.copy(values);
    }

    entity._components[Component.name] = component;

    this._queryManager.onEntityComponentAdded(entity, Component);
    this.world.componentsManager.componentAddedToEntity(Component);

    this.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, Component);
  }

  /**
   * Remove a component from an entity
   * @param {Entity} entity Entity which will get removed the component
   * @param {*} Component Component to remove from the entity
   * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  entityRemoveComponent(entity, Component, immediately) {
    var index = entity._ComponentTypes.indexOf(Component);
    if (!~index) return;

    this.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, Component);

    if (immediately) {
      this._entityRemoveComponentSync(entity, Component, index);
    } else {
      if (entity._ComponentTypesToRemove.length === 0)
        this.entitiesWithComponentsToRemove.push(entity);

      entity._ComponentTypes.splice(index, 1);
      entity._ComponentTypesToRemove.push(Component);

      var componentName = getName(Component);
      entity._componentsToRemove[componentName] =
        entity._components[componentName];
      delete entity._components[componentName];
    }

    // Check each indexed query to see if we need to remove it
    this._queryManager.onEntityComponentRemoved(entity, Component);

    if (Component.__proto__ === SystemStateComponent) {
      entity.numStateComponents--;

      // Check if the entity was a ghost waiting for the last system state component to be removed
      if (entity.numStateComponents === 0 && !entity.alive) {
        entity.remove();
      }
    }
  }

  _entityRemoveComponentSync(entity, Component, index) {
    // Remove T listing on entity and property ref, then free the component.
    entity._ComponentTypes.splice(index, 1);
    var componentName = getName(Component);
    var component = entity._components[componentName];
    delete entity._components[componentName];
    component.dispose();
    this.world.componentsManager.componentRemovedFromEntity(Component);
  }

  /**
   * Remove all the components from an entity
   * @param {Entity} entity Entity from which the components will be removed
   */
  entityRemoveAllComponents(entity, immediately) {
    let Components = entity._ComponentTypes;

    for (let j = Components.length - 1; j >= 0; j--) {
      if (Components[j].__proto__ !== SystemStateComponent)
        this.entityRemoveComponent(entity, Components[j], immediately);
    }
  }

  /**
   * Remove the entity from this manager. It will clear also its components
   * @param {Entity} entity Entity to remove from the manager
   * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  removeEntity(entity, immediately) {
    var index = this._entities.indexOf(entity);

    if (!~index) throw new Error("Tried to remove entity not in list");

    entity.alive = false;

    if (entity.numStateComponents === 0) {
      // Remove from entity list
      this.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity);
      this._queryManager.onEntityRemoved(entity);
      if (immediately === true) {
        this._releaseEntity(entity, index);
      } else {
        this.entitiesToRemove.push(entity);
      }
    }

    this.entityRemoveAllComponents(entity, immediately);
  }

  _releaseEntity(entity, index) {
    this._entities.splice(index, 1);

    if (this._entitiesByNames[entity.name]) {
      delete this._entitiesByNames[entity.name];
    }
    entity._pool.release(entity);
  }

  /**
   * Remove all entities from this manager
   */
  removeAllEntities() {
    for (var i = this._entities.length - 1; i >= 0; i--) {
      this.removeEntity(this._entities[i]);
    }
  }

  processDeferredRemoval() {
    if (!this.deferredRemovalEnabled) {
      return;
    }

    for (let i = 0; i < this.entitiesToRemove.length; i++) {
      let entity = this.entitiesToRemove[i];
      let index = this._entities.indexOf(entity);
      this._releaseEntity(entity, index);
    }
    this.entitiesToRemove.length = 0;

    for (let i = 0; i < this.entitiesWithComponentsToRemove.length; i++) {
      let entity = this.entitiesWithComponentsToRemove[i];
      while (entity._ComponentTypesToRemove.length > 0) {
        let Component = entity._ComponentTypesToRemove.pop();

        var componentName = getName(Component);
        var component = entity._componentsToRemove[componentName];
        delete entity._componentsToRemove[componentName];
        component.dispose();
        this.world.componentsManager.componentRemovedFromEntity(Component);

        //this._entityRemoveComponentSync(entity, Component, index);
      }
    }

    this.entitiesWithComponentsToRemove.length = 0;
  }

  /**
   * Get a query based on a list of components
   * @param {Array(Component)} Components List of components that will form the query
   */
  queryComponents(Components) {
    return this._queryManager.getQuery(Components);
  }

  // EXTRAS

  /**
   * Return number of entities
   */
  count() {
    return this._entities.length;
  }

  /**
   * Return some stats
   */
  stats() {
    var stats = {
      numEntities: this._entities.length,
      numQueries: Object.keys(this._queryManager._queries).length,
      queries: this._queryManager.stats(),
      numComponentPool: Object.keys(this.componentsManager._componentPool)
        .length,
      componentPool: {},
      eventDispatcher: this.eventDispatcher.stats
    };

    for (var cname in this.componentsManager._componentPool) {
      var pool = this.componentsManager._componentPool[cname];
      stats.componentPool[cname] = {
        used: pool.totalUsed(),
        size: pool.count
      };
    }

    return stats;
  }
}

const ENTITY_CREATED = "EntityManager#ENTITY_CREATE";
const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED";
const COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED";
const COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE";

class ComponentManager {
  constructor() {
    this.Components = {};
    this._componentPool = {};
    this.numComponents = {};
  }

  registerComponent(Component, objectPool) {
    if (this.Components[Component.name]) {
      console.warn(`Component type: '${Component.name}' already registered.`);
      return;
    }

    const schema = Component.schema;

    if (!schema) {
      throw new Error(`Component "${Component.name}" has no schema property.`);
    }

    for (const propName in schema) {
      const prop = schema[propName];

      if (!prop.type) {
        throw new Error(
          `Invalid schema for component "${Component.name}". Missing type for "${propName}" property.`
        );
      }
    }

    this.Components[Component.name] = Component;
    this.numComponents[Component.name] = 0;

    if (objectPool === undefined) {
      objectPool = new ObjectPool(Component);
    } else if (objectPool === false) {
      objectPool = undefined;
    }

    this._componentPool[Component.name] = objectPool;
  }

  componentAddedToEntity(Component) {
    if (!this.Components[Component.name]) {
      this.registerComponent(Component);
    }

    this.numComponents[Component.name]++;
  }

  componentRemovedFromEntity(Component) {
    this.numComponents[Component.name]--;
  }

  getComponentsPool(Component) {
    var componentName = componentPropertyName(Component);
    return this._componentPool[componentName];
  }
}

const Version = "0.3.1";

class Entity {
  constructor(entityManager) {
    this._entityManager = entityManager || null;

    // Unique ID for this entity
    this.id = entityManager._nextEntityId++;

    // List of components types the entity has
    this._ComponentTypes = [];

    // Instance of the components
    this._components = {};

    this._componentsToRemove = {};

    // Queries where the entity is added
    this.queries = [];

    // Used for deferred removal
    this._ComponentTypesToRemove = [];

    this.alive = false;

    //if there are state components on a entity, it can't be removed completely
    this.numStateComponents = 0;
  }

  // COMPONENTS

  getComponent(Component, includeRemoved) {
    var component = this._components[Component.name];

    if (!component && includeRemoved === true) {
      component = this._componentsToRemove[Component.name];
    }

    return  component;
  }

  getRemovedComponent(Component) {
    return this._componentsToRemove[Component.name];
  }

  getComponents() {
    return this._components;
  }

  getComponentsToRemove() {
    return this._componentsToRemove;
  }

  getComponentTypes() {
    return this._ComponentTypes;
  }

  getMutableComponent(Component) {
    var component = this._components[Component.name];
    for (var i = 0; i < this.queries.length; i++) {
      var query = this.queries[i];
      // @todo accelerate this check. Maybe having query._Components as an object
      // @todo add Not components
      if (query.reactive && query.Components.indexOf(Component) !== -1) {
        query.eventDispatcher.dispatchEvent(
          Query.prototype.COMPONENT_CHANGED,
          this,
          component
        );
      }
    }
    return component;
  }

  addComponent(Component, values) {
    this._entityManager.entityAddComponent(this, Component, values);
    return this;
  }

  removeComponent(Component, forceImmediate) {
    this._entityManager.entityRemoveComponent(this, Component, forceImmediate);
    return this;
  }

  hasComponent(Component, includeRemoved) {
    return (
      !!~this._ComponentTypes.indexOf(Component) ||
      (includeRemoved === true && this.hasRemovedComponent(Component))
    );
  }

  hasRemovedComponent(Component) {
    return !!~this._ComponentTypesToRemove.indexOf(Component);
  }

  hasAllComponents(Components) {
    for (var i = 0; i < Components.length; i++) {
      if (!this.hasComponent(Components[i])) return false;
    }
    return true;
  }

  hasAnyComponents(Components) {
    for (var i = 0; i < Components.length; i++) {
      if (this.hasComponent(Components[i])) return true;
    }
    return false;
  }

  removeAllComponents(forceImmediate) {
    return this._entityManager.entityRemoveAllComponents(this, forceImmediate);
  }

  copy(src) {
    // TODO: This can definitely be optimized
    for (var componentName in src._components) {
      var srcComponent = src._components[componentName];
      this.addComponent(srcComponent.constructor);
      var component = this.getComponent(srcComponent.constructor);
      component.copy(srcComponent);
    }

    return this;
  }

  clone() {
    return new Entity(this._entityManager).copy(this);
  }

  reset() {
    this.id = this._entityManager._nextEntityId++;
    this._ComponentTypes.length = 0;
    this.queries.length = 0;

    for (var componentName in this._components) {
      delete this._components[componentName];
    }
  }

  remove(forceImmediate) {
    return this._entityManager.removeEntity(this, forceImmediate);
  }
}

const DEFAULT_OPTIONS = {
  entityPoolSize: 0,
  entityClass: Entity
};

class World {
  constructor(options = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.componentsManager = new ComponentManager(this);
    this.entityManager = new EntityManager(this);
    this.systemManager = new SystemManager(this);

    this.enabled = true;

    this.eventQueues = {};

    if (hasWindow && typeof CustomEvent !== "undefined") {
      var event = new CustomEvent("ecsy-world-created", {
        detail: { world: this, version: Version }
      });
      window.dispatchEvent(event);
    }

    this.lastTime = now();
  }

  registerComponent(Component, objectPool) {
    this.componentsManager.registerComponent(Component, objectPool);
    return this;
  }

  registerSystem(System, attributes) {
    this.systemManager.registerSystem(System, attributes);
    return this;
  }

  unregisterSystem(System) {
    this.systemManager.unregisterSystem(System);
    return this;
  }

  getSystem(SystemClass) {
    return this.systemManager.getSystem(SystemClass);
  }

  getSystems() {
    return this.systemManager.getSystems();
  }

  execute(delta, time) {
    if (!delta) {
      time = now();
      delta = time - this.lastTime;
      this.lastTime = time;
    }

    if (this.enabled) {
      this.systemManager.execute(delta, time);
      this.entityManager.processDeferredRemoval();
    }
  }

  stop() {
    this.enabled = false;
  }

  play() {
    this.enabled = true;
  }

  createEntity(name) {
    return this.entityManager.createEntity(name);
  }

  stats() {
    var stats = {
      entities: this.entityManager.stats(),
      system: this.systemManager.stats()
    };

    console.log(JSON.stringify(stats, null, 2));
  }
}

class System {
  canExecute() {
    if (this._mandatoryQueries.length === 0) return true;

    for (let i = 0; i < this._mandatoryQueries.length; i++) {
      var query = this._mandatoryQueries[i];
      if (query.entities.length === 0) {
        return false;
      }
    }

    return true;
  }

  constructor(world, attributes) {
    this.world = world;
    this.enabled = true;

    // @todo Better naming :)
    this._queries = {};
    this.queries = {};

    this.priority = 0;

    // Used for stats
    this.executeTime = 0;

    if (attributes && attributes.priority) {
      this.priority = attributes.priority;
    }

    this._mandatoryQueries = [];

    this.initialized = true;

    if (this.constructor.queries) {
      for (var queryName in this.constructor.queries) {
        var queryConfig = this.constructor.queries[queryName];
        var Components = queryConfig.components;
        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query");
        }
        var query = this.world.entityManager.queryComponents(Components);
        this._queries[queryName] = query;
        if (queryConfig.mandatory === true) {
          this._mandatoryQueries.push(query);
        }
        this.queries[queryName] = {
          results: query.entities
        };

        // Reactive configuration added/removed/changed
        var validEvents = ["added", "removed", "changed"];

        const eventMapping = {
          added: Query.prototype.ENTITY_ADDED,
          removed: Query.prototype.ENTITY_REMOVED,
          changed: Query.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED
        };

        if (queryConfig.listen) {
          validEvents.forEach(eventName => {
            if (!this.execute) {
              console.warn(
                `System '${
                  this.constructor.name
                }' has defined listen events (${validEvents.join(
                  ", "
                )}) for query '${queryName}' but it does not implement the 'execute' method.`
              );
            }

            // Is the event enabled on this system's query?
            if (queryConfig.listen[eventName]) {
              let event = queryConfig.listen[eventName];

              if (eventName === "changed") {
                query.reactive = true;
                if (event === true) {
                  // Any change on the entity from the components in the query
                  let eventList = (this.queries[queryName][eventName] = []);
                  query.eventDispatcher.addEventListener(
                    Query.prototype.COMPONENT_CHANGED,
                    entity => {
                      // Avoid duplicates
                      if (eventList.indexOf(entity) === -1) {
                        eventList.push(entity);
                      }
                    }
                  );
                } else if (Array.isArray(event)) {
                  let eventList = (this.queries[queryName][eventName] = []);
                  query.eventDispatcher.addEventListener(
                    Query.prototype.COMPONENT_CHANGED,
                    (entity, changedComponent) => {
                      // Avoid duplicates
                      if (
                        event.indexOf(changedComponent.constructor) !== -1 &&
                        eventList.indexOf(entity) === -1
                      ) {
                        eventList.push(entity);
                      }
                    }
                  );
                }
              } else {
                let eventList = (this.queries[queryName][eventName] = []);

                query.eventDispatcher.addEventListener(
                  eventMapping[eventName],
                  entity => {
                    // @fixme overhead?
                    if (eventList.indexOf(entity) === -1)
                      eventList.push(entity);
                  }
                );
              }
            }
          });
        }
      }
    }
  }

  stop() {
    this.executeTime = 0;
    this.enabled = false;
  }

  play() {
    this.enabled = true;
  }

  // @question rename to clear queues?
  clearEvents() {
    for (let queryName in this.queries) {
      var query = this.queries[queryName];
      if (query.added) {
        query.added.length = 0;
      }
      if (query.removed) {
        query.removed.length = 0;
      }
      if (query.changed) {
        if (Array.isArray(query.changed)) {
          query.changed.length = 0;
        } else {
          for (let name in query.changed) {
            query.changed[name].length = 0;
          }
        }
      }
    }
  }

  toJSON() {
    var json = {
      name: this.constructor.name,
      enabled: this.enabled,
      executeTime: this.executeTime,
      priority: this.priority,
      queries: {}
    };

    if (this.constructor.queries) {
      var queries = this.constructor.queries;
      for (let queryName in queries) {
        let query = this.queries[queryName];
        let queryDefinition = queries[queryName];
        let jsonQuery = (json.queries[queryName] = {
          key: this._queries[queryName].key
        });

        jsonQuery.mandatory = queryDefinition.mandatory === true;
        jsonQuery.reactive =
          queryDefinition.listen &&
          (queryDefinition.listen.added === true ||
            queryDefinition.listen.removed === true ||
            queryDefinition.listen.changed === true ||
            Array.isArray(queryDefinition.listen.changed));

        if (jsonQuery.reactive) {
          jsonQuery.listen = {};

          const methods = ["added", "removed", "changed"];
          methods.forEach(method => {
            if (query[method]) {
              jsonQuery.listen[method] = {
                entities: query[method].length
              };
            }
          });
        }
      }
    }

    return json;
  }
}

System.isSystem = true;

class TagComponent extends Component {
  constructor() {
    super(false);
  }
}

TagComponent.isTagComponent = true;

const copyValue = src => src;

const cloneValue = src => src;

const copyArray = (src, dest) => {
  const srcArray = src;
  const destArray = dest;

  destArray.length = 0;

  for (let i = 0; i < srcArray.length; i++) {
    destArray.push(srcArray[i]);
  }

  return destArray;
};

const cloneArray = src => src.slice();

const copyJSON = src => JSON.parse(JSON.stringify(src));

const cloneJSON = src => JSON.parse(JSON.stringify(src));

function createType(typeDefinition) {
  var mandatoryProperties = ["name", "default", "copy", "clone"];

  var undefinedProperties = mandatoryProperties.filter(p => {
    return !typeDefinition.hasOwnProperty(p);
  });

  if (undefinedProperties.length > 0) {
    throw new Error(
      `createType expects a type definition with the following properties: ${undefinedProperties.join(
        ", "
      )}`
    );
  }

  typeDefinition.isType = true;

  return typeDefinition;
}

/**
 * Standard types
 */
const Types = {
  Number: createType({
    name: "Number",
    default: 0,
    copy: copyValue,
    clone: cloneValue
  }),

  Boolean: createType({
    name: "Boolean",
    default: false,
    copy: copyValue,
    clone: cloneValue
  }),

  String: createType({
    name: "String",
    default: "",
    copy: copyValue,
    clone: cloneValue
  }),

  Array: createType({
    name: "Array",
    default: [],
    copy: copyArray,
    clone: cloneArray
  }),

  Ref: createType({
    name: "Ref",
    default: undefined,
    copy: copyValue,
    clone: cloneValue
  }),

  JSON: createType({
    name: "JSON",
    default: null,
    copy: copyJSON,
    clone: cloneJSON
  })
};

function generateId(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function injectScript(src, onLoad) {
  var script = document.createElement("script");
  // @todo Use link to the ecsy-devtools repo?
  script.src = src;
  script.onload = onLoad;
  (document.head || document.documentElement).appendChild(script);
}

/* global Peer */

function hookConsoleAndErrors(connection) {
  var wrapFunctions = ["error", "warning", "log"];
  wrapFunctions.forEach(key => {
    if (typeof console[key] === "function") {
      var fn = console[key].bind(console);
      console[key] = (...args) => {
        connection.send({
          method: "console",
          type: key,
          args: JSON.stringify(args)
        });
        return fn.apply(null, args);
      };
    }
  });

  window.addEventListener("error", error => {
    connection.send({
      method: "error",
      error: JSON.stringify({
        message: error.error.message,
        stack: error.error.stack
      })
    });
  });
}

function includeRemoteIdHTML(remoteId) {
  let infoDiv = document.createElement("div");
  infoDiv.style.cssText = `
    align-items: center;
    background-color: #333;
    color: #aaa;
    display:flex;
    font-family: Arial;
    font-size: 1.1em;
    height: 40px;
    justify-content: center;
    left: 0;
    opacity: 0.9;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
  `;

  infoDiv.innerHTML = `Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${remoteId}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`;
  document.body.appendChild(infoDiv);

  return infoDiv;
}

function enableRemoteDevtools(remoteId) {
  if (!hasWindow) {
    console.warn("Remote devtools not available outside the browser");
    return;
  }

  window.generateNewCode = () => {
    window.localStorage.clear();
    remoteId = generateId(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
    window.location.reload(false);
  };

  remoteId = remoteId || window.localStorage.getItem("ecsyRemoteId");
  if (!remoteId) {
    remoteId = generateId(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
  }

  let infoDiv = includeRemoteIdHTML(remoteId);

  window.__ECSY_REMOTE_DEVTOOLS_INJECTED = true;
  window.__ECSY_REMOTE_DEVTOOLS = {};

  let Version = "";

  // This is used to collect the worlds created before the communication is being established
  let worldsBeforeLoading = [];
  let onWorldCreated = e => {
    var world = e.detail.world;
    Version = e.detail.version;
    worldsBeforeLoading.push(world);
  };
  window.addEventListener("ecsy-world-created", onWorldCreated);

  let onLoaded = () => {
    var peer = new Peer(remoteId);
    peer.on("open", (/* id */) => {
      peer.on("connection", connection => {
        window.__ECSY_REMOTE_DEVTOOLS.connection = connection;
        connection.on("open", function() {
          // infoDiv.style.visibility = "hidden";
          infoDiv.innerHTML = "Connected";

          // Receive messages
          connection.on("data", function(data) {
            if (data.type === "init") {
              var script = document.createElement("script");
              script.setAttribute("type", "text/javascript");
              script.onload = () => {
                script.parentNode.removeChild(script);

                // Once the script is injected we don't need to listen
                window.removeEventListener(
                  "ecsy-world-created",
                  onWorldCreated
                );
                worldsBeforeLoading.forEach(world => {
                  var event = new CustomEvent("ecsy-world-created", {
                    detail: { world: world, version: Version }
                  });
                  window.dispatchEvent(event);
                });
              };
              script.innerHTML = data.script;
              (document.head || document.documentElement).appendChild(script);
              script.onload();

              hookConsoleAndErrors(connection);
            } else if (data.type === "executeScript") {
              let value = eval(data.script);
              if (data.returnEval) {
                connection.send({
                  method: "evalReturn",
                  value: value
                });
              }
            }
          });
        });
      });
    });
  };

  // Inject PeerJS script
  injectScript(
    "https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js",
    onLoaded
  );
}

if (hasWindow) {
  const urlParams = new URLSearchParams(window.location.search);

  // @todo Provide a way to disable it if needed
  if (urlParams.has("enable-remote-devtools")) {
    enableRemoteDevtools();
  }
}

/**
 * Return the name of a component
 * @param {Component} Component
 * @private
 */
function getName$1(Component) {
  return Component.name;
}
/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */

function queryKey$1(Components) {
  var names = [];

  for (var n = 0; n < Components.length; n++) {
    var T = Components[n];

    if (typeof T === "object") {
      var operator = T.operator === "not" ? "!" : T.operator;
      names.push(operator + getName$1(T.Component));
    } else {
      names.push(getName$1(T));
    }
  }

  return names.sort().join("-");
} // Detector for browser's "window"

const hasWindow$1 = typeof window !== "undefined"; // performance.now() "polyfill"

const now$1 = hasWindow$1 && typeof window.performance !== "undefined" ? performance.now.bind(performance) : Date.now.bind(Date);

/**
 * @private
 * @class EventDispatcher
 */
class EventDispatcher$1 {
  constructor() {
    this._listeners = {};
    this.stats = {
      fired: 0,
      handled: 0
    };
  }
  /**
   * Add an event listener
   * @param {String} eventName Name of the event to listen
   * @param {Function} listener Callback to trigger when the event is fired
   */


  addEventListener(eventName, listener) {
    let listeners = this._listeners;

    if (listeners[eventName] === undefined) {
      listeners[eventName] = [];
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener);
    }
  }
  /**
   * Check if an event listener is already added to the list of listeners
   * @param {String} eventName Name of the event to check
   * @param {Function} listener Callback for the specified event
   */


  hasEventListener(eventName, listener) {
    return this._listeners[eventName] !== undefined && this._listeners[eventName].indexOf(listener) !== -1;
  }
  /**
   * Remove an event listener
   * @param {String} eventName Name of the event to remove
   * @param {Function} listener Callback for the specified event
   */


  removeEventListener(eventName, listener) {
    var listenerArray = this._listeners[eventName];

    if (listenerArray !== undefined) {
      var index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }
  /**
   * Dispatch an event
   * @param {String} eventName Name of the event to dispatch
   * @param {Entity} entity (Optional) Entity to emit
   * @param {Component} component
   */


  dispatchEvent(eventName, entity, component) {
    this.stats.fired++;
    var listenerArray = this._listeners[eventName];

    if (listenerArray !== undefined) {
      var array = listenerArray.slice(0);

      for (var i = 0; i < array.length; i++) {
        array[i].call(this, entity, component);
      }
    }
  }
  /**
   * Reset stats counters
   */


  resetCounters() {
    this.stats.fired = this.stats.handled = 0;
  }

}

class Query$1 {
  /**
   * @param {Array(Component)} Components List of types of components to query
   */
  constructor(Components, manager) {
    this.Components = [];
    this.NotComponents = [];
    Components.forEach(component => {
      if (typeof component === "object") {
        this.NotComponents.push(component.Component);
      } else {
        this.Components.push(component);
      }
    });

    if (this.Components.length === 0) {
      throw new Error("Can't create a query without components");
    }

    this.entities = [];
    this.eventDispatcher = new EventDispatcher$1(); // This query is being used by a reactive system

    this.reactive = false;
    this.key = queryKey$1(Components); // Fill the query with the existing entities

    for (var i = 0; i < manager._entities.length; i++) {
      var entity = manager._entities[i];

      if (this.match(entity)) {
        // @todo ??? this.addEntity(entity); => preventing the event to be generated
        entity.queries.push(this);
        this.entities.push(entity);
      }
    }
  }
  /**
   * Add entity to this query
   * @param {Entity} entity
   */


  addEntity(entity) {
    entity.queries.push(this);
    this.entities.push(entity);
    this.eventDispatcher.dispatchEvent(Query$1.prototype.ENTITY_ADDED, entity);
  }
  /**
   * Remove entity from this query
   * @param {Entity} entity
   */


  removeEntity(entity) {
    let index = this.entities.indexOf(entity);

    if (~index) {
      this.entities.splice(index, 1);
      index = entity.queries.indexOf(this);
      entity.queries.splice(index, 1);
      this.eventDispatcher.dispatchEvent(Query$1.prototype.ENTITY_REMOVED, entity);
    }
  }

  match(entity) {
    return entity.hasAllComponents(this.Components) && !entity.hasAnyComponents(this.NotComponents);
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.Components.map(C => C.name),
        not: this.NotComponents.map(C => C.name)
      },
      numEntities: this.entities.length
    };
  }
  /**
   * Return stats for this query
   */


  stats() {
    return {
      numComponents: this.Components.length,
      numEntities: this.entities.length
    };
  }

}
Query$1.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
Query$1.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
Query$1.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";

class Component$1 {
  constructor(props) {
    if (props !== false) {
      const schema = this.constructor.schema;

      for (const key in schema) {
        if (props && props.hasOwnProperty(key)) {
          this[key] = props[key];
        } else {
          const schemaProp = schema[key];

          if (schemaProp.hasOwnProperty("default")) {
            this[key] = schemaProp.type.clone(schemaProp.default);
          } else {
            const type = schemaProp.type;
            this[key] = type.clone(type.default);
          }
        }
      }
    }

    this._pool = null;
  }

  copy(source) {
    const schema = this.constructor.schema;

    for (const key in schema) {
      const prop = schema[key];

      if (source.hasOwnProperty(key)) {
        this[key] = prop.type.copy(source[key], this[key]);
      }
    }

    return this;
  }

  clone() {
    return new this.constructor().copy(this);
  }

  reset() {
    const schema = this.constructor.schema;

    for (const key in schema) {
      const schemaProp = schema[key];

      if (schemaProp.hasOwnProperty("default")) {
        this[key] = schemaProp.type.copy(schemaProp.default, this[key]);
      } else {
        const type = schemaProp.type;
        this[key] = type.copy(type.default, this[key]);
      }
    }
  }

  dispose() {
    if (this._pool) {
      this._pool.release(this);
    }
  }

}
Component$1.schema = {};
Component$1.isComponent = true;

class System$1 {
  canExecute() {
    if (this._mandatoryQueries.length === 0) return true;

    for (let i = 0; i < this._mandatoryQueries.length; i++) {
      var query = this._mandatoryQueries[i];

      if (query.entities.length === 0) {
        return false;
      }
    }

    return true;
  }

  constructor(world, attributes) {
    this.world = world;
    this.enabled = true; // @todo Better naming :)

    this._queries = {};
    this.queries = {};
    this.priority = 0; // Used for stats

    this.executeTime = 0;

    if (attributes && attributes.priority) {
      this.priority = attributes.priority;
    }

    this._mandatoryQueries = [];
    this.initialized = true;

    if (this.constructor.queries) {
      for (var queryName in this.constructor.queries) {
        var queryConfig = this.constructor.queries[queryName];
        var Components = queryConfig.components;

        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query");
        }

        var query = this.world.entityManager.queryComponents(Components);
        this._queries[queryName] = query;

        if (queryConfig.mandatory === true) {
          this._mandatoryQueries.push(query);
        }

        this.queries[queryName] = {
          results: query.entities
        }; // Reactive configuration added/removed/changed

        var validEvents = ["added", "removed", "changed"];
        const eventMapping = {
          added: Query$1.prototype.ENTITY_ADDED,
          removed: Query$1.prototype.ENTITY_REMOVED,
          changed: Query$1.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED

        };

        if (queryConfig.listen) {
          validEvents.forEach(eventName => {
            if (!this.execute) {
              console.warn(`System '${this.constructor.name}' has defined listen events (${validEvents.join(", ")}) for query '${queryName}' but it does not implement the 'execute' method.`);
            } // Is the event enabled on this system's query?


            if (queryConfig.listen[eventName]) {
              let event = queryConfig.listen[eventName];

              if (eventName === "changed") {
                query.reactive = true;

                if (event === true) {
                  // Any change on the entity from the components in the query
                  let eventList = this.queries[queryName][eventName] = [];
                  query.eventDispatcher.addEventListener(Query$1.prototype.COMPONENT_CHANGED, entity => {
                    // Avoid duplicates
                    if (eventList.indexOf(entity) === -1) {
                      eventList.push(entity);
                    }
                  });
                } else if (Array.isArray(event)) {
                  let eventList = this.queries[queryName][eventName] = [];
                  query.eventDispatcher.addEventListener(Query$1.prototype.COMPONENT_CHANGED, (entity, changedComponent) => {
                    // Avoid duplicates
                    if (event.indexOf(changedComponent.constructor) !== -1 && eventList.indexOf(entity) === -1) {
                      eventList.push(entity);
                    }
                  });
                }
              } else {
                let eventList = this.queries[queryName][eventName] = [];
                query.eventDispatcher.addEventListener(eventMapping[eventName], entity => {
                  // @fixme overhead?
                  if (eventList.indexOf(entity) === -1) eventList.push(entity);
                });
              }
            }
          });
        }
      }
    }
  }

  stop() {
    this.executeTime = 0;
    this.enabled = false;
  }

  play() {
    this.enabled = true;
  } // @question rename to clear queues?


  clearEvents() {
    for (let queryName in this.queries) {
      var query = this.queries[queryName];

      if (query.added) {
        query.added.length = 0;
      }

      if (query.removed) {
        query.removed.length = 0;
      }

      if (query.changed) {
        if (Array.isArray(query.changed)) {
          query.changed.length = 0;
        } else {
          for (let name in query.changed) {
            query.changed[name].length = 0;
          }
        }
      }
    }
  }

  toJSON() {
    var json = {
      name: this.constructor.name,
      enabled: this.enabled,
      executeTime: this.executeTime,
      priority: this.priority,
      queries: {}
    };

    if (this.constructor.queries) {
      var queries = this.constructor.queries;

      for (let queryName in queries) {
        let query = this.queries[queryName];
        let queryDefinition = queries[queryName];
        let jsonQuery = json.queries[queryName] = {
          key: this._queries[queryName].key
        };
        jsonQuery.mandatory = queryDefinition.mandatory === true;
        jsonQuery.reactive = queryDefinition.listen && (queryDefinition.listen.added === true || queryDefinition.listen.removed === true || queryDefinition.listen.changed === true || Array.isArray(queryDefinition.listen.changed));

        if (jsonQuery.reactive) {
          jsonQuery.listen = {};
          const methods = ["added", "removed", "changed"];
          methods.forEach(method => {
            if (query[method]) {
              jsonQuery.listen[method] = {
                entities: query[method].length
              };
            }
          });
        }
      }
    }

    return json;
  }

}
System$1.isSystem = true;

class TagComponent$1 extends Component$1 {
  constructor() {
    super(false);
  }

}
TagComponent$1.isTagComponent = true;

const copyValue$1 = src => src;
const cloneValue$1 = src => src;
const copyArray$1 = (src, dest) => {
  const srcArray = src;
  const destArray = dest;
  destArray.length = 0;

  for (let i = 0; i < srcArray.length; i++) {
    destArray.push(srcArray[i]);
  }

  return destArray;
};
const cloneArray$1 = src => src.slice();
const copyJSON$1 = src => JSON.parse(JSON.stringify(src));
const cloneJSON$1 = src => JSON.parse(JSON.stringify(src));
function createType$1(typeDefinition) {
  var mandatoryProperties = ["name", "default", "copy", "clone"];
  var undefinedProperties = mandatoryProperties.filter(p => {
    return !typeDefinition.hasOwnProperty(p);
  });

  if (undefinedProperties.length > 0) {
    throw new Error(`createType expects a type definition with the following properties: ${undefinedProperties.join(", ")}`);
  }

  typeDefinition.isType = true;
  return typeDefinition;
}
/**
 * Standard types
 */

const Types$1 = {
  Number: createType$1({
    name: "Number",
    default: 0,
    copy: copyValue$1,
    clone: cloneValue$1
  }),
  Boolean: createType$1({
    name: "Boolean",
    default: false,
    copy: copyValue$1,
    clone: cloneValue$1
  }),
  String: createType$1({
    name: "String",
    default: "",
    copy: copyValue$1,
    clone: cloneValue$1
  }),
  Array: createType$1({
    name: "Array",
    default: [],
    copy: copyArray$1,
    clone: cloneArray$1
  }),
  Ref: createType$1({
    name: "Ref",
    default: undefined,
    copy: copyValue$1,
    clone: cloneValue$1
  }),
  JSON: createType$1({
    name: "JSON",
    default: null,
    copy: copyJSON$1,
    clone: cloneJSON$1
  })
};

function generateId$1(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
function injectScript$1(src, onLoad) {
  var script = document.createElement("script"); // @todo Use link to the ecsy-devtools repo?

  script.src = src;
  script.onload = onLoad;
  (document.head || document.documentElement).appendChild(script);
}

/* global Peer */

function hookConsoleAndErrors$1(connection) {
  var wrapFunctions = ["error", "warning", "log"];
  wrapFunctions.forEach(key => {
    if (typeof console[key] === "function") {
      var fn = console[key].bind(console);

      console[key] = (...args) => {
        connection.send({
          method: "console",
          type: key,
          args: JSON.stringify(args)
        });
        return fn.apply(null, args);
      };
    }
  });
  window.addEventListener("error", error => {
    connection.send({
      method: "error",
      error: JSON.stringify({
        message: error.error.message,
        stack: error.error.stack
      })
    });
  });
}

function includeRemoteIdHTML$1(remoteId) {
  let infoDiv = document.createElement("div");
  infoDiv.style.cssText = `
    align-items: center;
    background-color: #333;
    color: #aaa;
    display:flex;
    font-family: Arial;
    font-size: 1.1em;
    height: 40px;
    justify-content: center;
    left: 0;
    opacity: 0.9;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
  `;
  infoDiv.innerHTML = `Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${remoteId}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`;
  document.body.appendChild(infoDiv);
  return infoDiv;
}

function enableRemoteDevtools$1(remoteId) {
  if (!hasWindow$1) {
    console.warn("Remote devtools not available outside the browser");
    return;
  }

  window.generateNewCode = () => {
    window.localStorage.clear();
    remoteId = generateId$1(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
    window.location.reload(false);
  };

  remoteId = remoteId || window.localStorage.getItem("ecsyRemoteId");

  if (!remoteId) {
    remoteId = generateId$1(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
  }

  let infoDiv = includeRemoteIdHTML$1(remoteId);
  window.__ECSY_REMOTE_DEVTOOLS_INJECTED = true;
  window.__ECSY_REMOTE_DEVTOOLS = {};
  let Version = ""; // This is used to collect the worlds created before the communication is being established

  let worldsBeforeLoading = [];

  let onWorldCreated = e => {
    var world = e.detail.world;
    Version = e.detail.version;
    worldsBeforeLoading.push(world);
  };

  window.addEventListener("ecsy-world-created", onWorldCreated);

  let onLoaded = () => {
    var peer = new Peer(remoteId);
    peer.on("open", () =>
    /* id */
    {
      peer.on("connection", connection => {
        window.__ECSY_REMOTE_DEVTOOLS.connection = connection;
        connection.on("open", function () {
          // infoDiv.style.visibility = "hidden";
          infoDiv.innerHTML = "Connected"; // Receive messages

          connection.on("data", function (data) {
            if (data.type === "init") {
              var script = document.createElement("script");
              script.setAttribute("type", "text/javascript");

              script.onload = () => {
                script.parentNode.removeChild(script); // Once the script is injected we don't need to listen

                window.removeEventListener("ecsy-world-created", onWorldCreated);
                worldsBeforeLoading.forEach(world => {
                  var event = new CustomEvent("ecsy-world-created", {
                    detail: {
                      world: world,
                      version: Version
                    }
                  });
                  window.dispatchEvent(event);
                });
              };

              script.innerHTML = data.script;
              (document.head || document.documentElement).appendChild(script);
              script.onload();
              hookConsoleAndErrors$1(connection);
            } else if (data.type === "executeScript") {
              let value = eval(data.script);

              if (data.returnEval) {
                connection.send({
                  method: "evalReturn",
                  value: value
                });
              }
            }
          });
        });
      });
    });
  }; // Inject PeerJS script


  injectScript$1("https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js", onLoaded);
}

if (hasWindow$1) {
  const urlParams = new URLSearchParams(window.location.search); // @todo Provide a way to disable it if needed

  if (urlParams.has("enable-remote-devtools")) {
    enableRemoteDevtools$1();
  }
}

// Constructs a component with a map and data values
// Data contains a map() of arbitrary data
class BehaviorComponent extends Component$1 {
    constructor() {
        super(false);
        this.data = new Map();
        this.data = new Map();
    }
    copy(src) {
        this.map = src.map;
        this.data = new Map(src.data);
        return this;
    }
    reset() {
        this.data.clear();
    }
}

// Input inherits from BehaviorComponent, which adds .map and .data
class Input$1 extends BehaviorComponent {
}
// Set schema to itself plus gamepad data
Input$1.schema = Object.assign(Object.assign({}, Input$1.schema), { gamepadConnected: { type: Types$1.Boolean, default: false }, gamepadThreshold: { type: Types$1.Number, default: 0.1 }, gamepadButtons: { type: Types$1.Array, default: [] }, gamepadInput: { type: Types$1.Array, default: [] } });

var BinaryValue;
(function (BinaryValue) {
    BinaryValue[BinaryValue["ON"] = 1] = "ON";
    BinaryValue[BinaryValue["OFF"] = 0] = "OFF";
})(BinaryValue || (BinaryValue = {}));
var BinaryValue$1 = BinaryValue;

// Button -- discrete states of ON and OFF, like a button
// OneD -- one dimensional value between 0 and 1, or -1 and 1, like a trigger
// TwoD -- Two dimensional value with x: -1, 1 and y: -1, 1 like a mouse input
// ThreeD -- Three dimensional value, just in case
// 6DOF -- Six dimensional input, three for pose and three for rotation (in euler?), i.e. for VR controllers
var InputType;
(function (InputType) {
    InputType[InputType["BUTTON"] = 0] = "BUTTON";
    InputType[InputType["ONED"] = 1] = "ONED";
    InputType[InputType["TWOD"] = 2] = "TWOD";
    InputType[InputType["THREED"] = 3] = "THREED";
    InputType[InputType["SIXDOF"] = 4] = "SIXDOF";
})(InputType || (InputType = {}));

// Local reference to input component
let input;
const _value = [0, 0];
// System behavior called whenever the mouse pressed
const handleMouseMovement = (entity, args) => {
    input = entity.getComponent(Input$1);
    _value[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
    _value[1] = (args.event.clientY / window.innerHeight) * -2 + 1;
    // Set type to TWOD (two-dimensional axis) and value to a normalized -1, 1 on X and Y
    input.data.set(input.map.mouseInputMap.axes["mousePosition"], {
        type: InputType.TWOD,
        value: _value
    });
};
// System behavior called when a mouse button is fired
const handleMouseButton = (entity, args) => {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
    input = entity.getComponent(Input$1);
    if (input.map.mouseInputMap.buttons[args.event.button] === undefined)
        return; // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
    if (args.value === BinaryValue$1.ON) {
        console.log("Mouse button down: " + args.event.button);
        input.data.set(input.map.mouseInputMap.buttons[args.event.button], {
            type: InputType.BUTTON,
            value: args.value
        });
    }
    else {
        console.log("Mouse button up" + args.event.button);
        input.data.delete(input.map.mouseInputMap.buttons[args.event.button]);
    }
};
// System behavior called when a keyboard key is pressed
function handleKey(entity, args) {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
    input = entity.getComponent(Input$1);
    if (input.map.keyboardInputMap[args.event.key] === undefined)
        return;
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input.data.has(input.map.keyboardInputMap[args.event.key]) && input.data.get(input.map.keyboardInputMap[args.event.key]).value === args.value)
        return;
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    if (args.value === BinaryValue$1.ON) {
        console.log("Key down: " + args.event.key);
        input.data.set(input.map.keyboardInputMap[args.event.key], {
            type: InputType.BUTTON,
            value: args.value
        });
    }
    else {
        console.log("Key up:" + args.event.key);
        input.data.delete(input.map.mouseInputMap.buttons[args.event.key]);
    }
}

var GamepadButtons;
(function (GamepadButtons) {
    GamepadButtons[GamepadButtons["A"] = 0] = "A";
    GamepadButtons[GamepadButtons["B"] = 1] = "B";
    GamepadButtons[GamepadButtons["X"] = 2] = "X";
    GamepadButtons[GamepadButtons["Y"] = 3] = "Y";
    GamepadButtons[GamepadButtons["LBumper"] = 4] = "LBumper";
    GamepadButtons[GamepadButtons["RBumper"] = 5] = "RBumper";
    GamepadButtons[GamepadButtons["LTrigger"] = 6] = "LTrigger";
    GamepadButtons[GamepadButtons["RTrigger"] = 7] = "RTrigger";
    GamepadButtons[GamepadButtons["Back"] = 8] = "Back";
    GamepadButtons[GamepadButtons["Start"] = 9] = "Start";
    GamepadButtons[GamepadButtons["LStick"] = 10] = "LStick";
    GamepadButtons[GamepadButtons["RString"] = 11] = "RString";
    GamepadButtons[GamepadButtons["DPad1"] = 12] = "DPad1";
    GamepadButtons[GamepadButtons["DPad2"] = 13] = "DPad2";
    GamepadButtons[GamepadButtons["DPad3"] = 14] = "DPad3";
    GamepadButtons[GamepadButtons["DPad4"] = 15] = "DPad4";
})(GamepadButtons || (GamepadButtons = {}));

var Thumbsticks;
(function (Thumbsticks) {
    Thumbsticks[Thumbsticks["Left"] = 0] = "Left";
    Thumbsticks[Thumbsticks["Right"] = 1] = "Right";
})(Thumbsticks || (Thumbsticks = {}));

function preventDefault(e) {
    event.preventDefault();
}

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
function preventDefault$1(e) {
    e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault$1(e);
        return false;
    }
}
// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, "passive", {
        get: function () {
            supportsPassive = true;
        }
    }));
    // eslint-disable-next-line no-empty
}
catch (e) { }
const wheelOpt = supportsPassive ? { passive: false } : false;
const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
// call this to Disable
function disableScroll() {
    window.addEventListener("DOMMouseScroll", preventDefault$1, false); // older FF
    window.addEventListener(wheelEvent, preventDefault$1, wheelOpt); // modern desktop
    window.addEventListener("touchmove", preventDefault$1, wheelOpt); // mobile
    window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}
// call this to Enable
function enableScroll() {
    window.removeEventListener("DOMMouseScroll", preventDefault$1, false);
    window.removeEventListener(wheelEvent, preventDefault$1);
    window.removeEventListener("touchmove", preventDefault$1);
    window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

let input$1;
let gamepad;
// When a gamepad connects
const handleGamepadConnected = (entity, args) => {
    input$1 = entity.getMutableComponent(Input$1);
    console.log("A gamepad connected:", args.event.gamepad, args.event.gamepad.mapping);
    if (args.event.gamepad.mapping !== "standard")
        return console.error("Non-standard gamepad mapping detected, not properly handled");
    input$1.gamepadConnected = true;
    gamepad = args.event.gamepad;
    for (let index = 0; index < gamepad.buttons.length; index++) {
        if (typeof input$1.gamepadButtons[index] === "undefined")
            input$1.gamepadButtons[index] = BinaryValue$1.OFF;
    }
};
// When a gamepad disconnects
const handleGamepadDisconnected = (entity, args) => {
    input$1 = entity.getMutableComponent(Input$1);
    console.log("A gamepad disconnected:", args.event.gamepad);
    input$1.gamepadConnected = false;
    if (!input$1.map)
        return; // Already disconnected?
    for (let index = 0; index < input$1.gamepadButtons.length; index++) {
        if (input$1.gamepadButtons[index] === BinaryValue$1.ON && typeof input$1.map.gamepadInputMap.axes[index] !== "undefined") {
            input$1.data.set(input$1.map.gamepadInputMap.axes[index], {
                type: InputType.BUTTON,
                value: BinaryValue$1.OFF
            });
        }
        input$1.gamepadButtons[index] = BinaryValue$1.OFF;
    }
};

const defaultJumpValues = {
    canJump: true,
    t: 0,
    height: 1.0,
    duration: 1.0
};
class Actor extends Component$1 {
    constructor() {
        super();
        this.jump = defaultJumpValues;
        this.reset();
    }
    copy(src) {
        this.rotationSpeedX = src.rotationSpeedX;
        this.rotationSpeedY = src.rotationSpeedY;
        this.maxSpeed = src.maxSpeed;
        this.accelerationSpeed = src.accelerationSpeed;
        this.jump = src.jump;
        return this;
    }
    reset() {
        this.rotationSpeedX = 1;
        this.rotationSpeedY = 1;
        this.maxSpeed = 10;
        this.accelerationSpeed = 1;
        this.jump = defaultJumpValues;
    }
}

const vector3Identity = [0, 0, 0];
const vector3ScaleIdentity = [1, 1, 1];
const quaternionIdentity = [0, 0, 0, 1];
class TransformComponent extends Component$1 {
    constructor() {
        super();
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
    }
    copy(src) {
        this.position = src.position;
        this.rotation = src.rotation;
        this.scale = src.scale;
        this.velocity = src.velocity;
        return this;
    }
    reset() {
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
    }
}

let actor;
let transform;
const jump = (entity) => {
    console.log("Jump!");
    addState(entity, { state: DefaultStateTypes.JUMPING });
    actor = entity.getMutableComponent(Actor);
    actor.jump.t = 0;
};
const jumping = (entity, args, delta) => {
    transform = entity.getComponent(TransformComponent);
    actor = entity.getMutableComponent(Actor);
    actor.jump.t += delta;
    if (actor.jump.t < actor.jump.duration) {
        transform.velocity[1] = transform.velocity[1] + Math.cos((actor.jump.t / actor.jump.duration) * Math.PI);
        console.log("Jumping: " + actor.jump.t);
        return;
    }
    removeState(entity, { state: DefaultStateTypes.JUMPING });
    console.log("Jumped");
};

const DefaultStateTypes = {
    // Main States
    IDLE: 0,
    MOVING: 1,
    JUMPING: 2,
    FALLING: 3,
    // Modifier States
    CROUCHING: 4,
    WALKING: 5,
    SPRINTING: 6,
    INTERACTING: 7,
    // Moving substates
    MOVING_FORWARD: 8,
    MOVING_BACKWARD: 9,
    MOVING_LEFT: 10,
    MOVING_RIGHT: 11
};
const DefaultStateGroups = {
    MOVEMENT: 0,
    MOVEMENT_MODIFIERS: 1
};
const DefaultStateMap = {
    groups: {
        [DefaultStateGroups.MOVEMENT]: {
            exclusive: true,
            default: DefaultStateTypes.IDLE,
            states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING]
        },
        [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
            exclusive: true,
            states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING, DefaultStateTypes.JUMPING]
        }
    },
    states: {
        [DefaultStateTypes.IDLE]: { group: DefaultStateGroups.MOVEMENT },
        [DefaultStateTypes.MOVING]: {
            group: DefaultStateGroups.MOVEMENT
        },
        [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, onUpdate: { behavior: jumping } },
        [DefaultStateTypes.CROUCHING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, blockedBy: DefaultStateTypes.JUMPING },
        [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS }
    }
};

class State extends BehaviorComponent {
    constructor() {
        super(...arguments);
        this.map = DefaultStateMap;
    }
}

var StateType;
(function (StateType) {
    StateType[StateType["DISCRETE"] = 0] = "DISCRETE";
    StateType[StateType["ONED"] = 1] = "ONED";
    StateType[StateType["TWOD"] = 2] = "TWOD";
    StateType[StateType["THREED"] = 3] = "THREED";
})(StateType || (StateType = {}));

let stateComponent;
let stateGroup;
const addState = (entity, args) => {
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state))
        return;
    console.log("Adding state: " + args.state);
    stateComponent.data.set(args.state, {
        state: args.state,
        type: StateType.DISCRETE,
        value: BinaryValue$1.ON,
        group: stateComponent.map.states[args.state].group
    });
    stateGroup = stateComponent.map.states[args.state].group;
    // If state group is set to exclusive (XOR) then check if other states from state group are on
    if (stateComponent.map.groups[stateGroup].exclusive) {
        stateComponent.map.groups[stateGroup].states.forEach(state => {
            if (state === args.state || !stateComponent.data.has(state))
                return;
            stateComponent.data.delete(state);
            console.log("Removed mutex state " + state);
        });
    }
};
const removeState = (entity, args) => {
    // check state group
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state)) {
        stateComponent.data.delete(args.state);
        console.log("Removed component from " + entity.id);
    }
};

class Crouching extends TagComponent$1 {
}

class Sprinting extends TagComponent$1 {
}

let input$2;
let actor$1;
let transform$1;
let inputValue; // Could be a (small) source of garbage
let inputType;
let movementModifer;
let outputSpeed;
const move = (entity, args, delta) => {
    input$2 = entity.getComponent(Input$1);
    actor$1 = entity.getComponent(Actor);
    transform$1 = entity.getComponent(TransformComponent);
    movementModifer = entity.hasComponent(Crouching) ? 0.5 : entity.hasComponent(Sprinting) ? 1.5 : 1.0;
    outputSpeed = actor$1.accelerationSpeed * delta * movementModifer;
    if (inputType === InputType.TWOD) {
        inputValue = input$2.data.get(args.input).value;
        transform$1.velocity[0] += Math.min(inputValue[0] + inputValue[0] * outputSpeed, actor$1.maxSpeed);
        transform$1.velocity[2] += Math.min(inputValue[1] + inputValue[1] * outputSpeed, actor$1.maxSpeed);
    }
    if (inputType === InputType.THREED) {
        inputValue = input$2.data.get(args.input).value;
        transform$1.velocity[0] += Math.min(inputValue[0] + inputValue[0] * outputSpeed, actor$1.maxSpeed);
        transform$1.velocity[1] += Math.min(inputValue[1] + inputValue[1] * outputSpeed, actor$1.maxSpeed);
        transform$1.velocity[2] += Math.min(inputValue[2] + inputValue[2] * outputSpeed, actor$1.maxSpeed);
    }
    else {
        console.error("Movement is only available for 2D and 3D inputs");
    }
    console.log("Moved");
};

const MouseButtons = {
    LeftButton: 0,
    MiddleButton: 1,
    RightButton: 2
};

// Abstract inputs that all input devices get mapped to
const DefaultInput = {
    PRIMARY: 0,
    SECONDARY: 1,
    FORWARD: 2,
    BACKWARD: 3,
    UP: 4,
    DOWN: 5,
    LEFT: 6,
    RIGHT: 7,
    INTERACT: 8,
    CROUCH: 9,
    JUMP: 10,
    WALK: 11,
    RUN: 12,
    SPRINT: 13,
    SNEAK: 14,
    SCREENXY: 15,
    MOVEMENT_PLAYERONE: 16,
    LOOKTURN_PLAYERONE: 17,
    MOVEMENT_PLAYERTWO: 18,
    LOOKTURN_PLAYERTWO: 19,
    ALTERNATE: 20
};
const DefaultInputMap = {
    // When an Input component is added, the system will call this array of behaviors
    onAdded: [
        {
            behavior: disableScroll
            // args: { }
        }
    ],
    // When an Input component is removed, the system will call this array of behaviors
    onRemoved: [
        {
            behavior: enableScroll
            // args: { }
        }
    ],
    // When the input component is added or removed, the system will bind/unbind these events to the DOM
    eventBindings: {
        // Mouse
        ["contextmenu"]: {
            behavior: preventDefault
        },
        ["mousemove"]: {
            behavior: handleMouseMovement,
            args: {
                value: DefaultInput.SCREENXY
            }
        },
        ["mouseup"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue$1.OFF
            }
        },
        ["mousedown"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue$1.ON
            }
        },
        // Keys
        ["keyup"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue$1.OFF
            }
        },
        ["keydown"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue$1.ON
            }
        },
        // Gamepad
        ["gamepadconnected"]: {
            behavior: handleGamepadConnected
        },
        ["gamepaddisconnected"]: {
            behavior: handleGamepadDisconnected
        }
    },
    // Map mouse buttons to abstract input
    mouseInputMap: {
        buttons: {
            [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
            [MouseButtons.RightButton]: DefaultInput.SECONDARY,
            [MouseButtons.MiddleButton]: DefaultInput.INTERACT
        },
        axes: {
            mousePosition: DefaultInput.SCREENXY
        }
    },
    // Map gamepad buttons to abstract input
    gamepadInputMap: {
        buttons: {
            [GamepadButtons.A]: DefaultInput.JUMP,
            [GamepadButtons.B]: DefaultInput.CROUCH,
            [GamepadButtons.X]: DefaultInput.SPRINT,
            [GamepadButtons.Y]: DefaultInput.INTERACT,
            // 4: DefaultInput.DEFAULT, // LB
            // 5: DefaultInput.DEFAULT, // RB
            // 6: DefaultInput.DEFAULT, // LT
            // 7: DefaultInput.DEFAULT, // RT
            // 8: DefaultInput.DEFAULT, // Back
            // 9: DefaultInput.DEFAULT, // Start
            // 10: DefaultInput.DEFAULT, // LStick
            // 11: DefaultInput.DEFAULT, // RStick
            [GamepadButtons.DPad1]: DefaultInput.FORWARD,
            [GamepadButtons.DPad2]: DefaultInput.BACKWARD,
            [GamepadButtons.DPad3]: DefaultInput.LEFT,
            [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
        },
        axes: {
            [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
            [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
        }
    },
    // Map keyboard buttons to abstract input
    keyboardInputMap: {
        w: DefaultInput.FORWARD,
        a: DefaultInput.LEFT,
        s: DefaultInput.RIGHT,
        d: DefaultInput.BACKWARD,
        [" "]: DefaultInput.JUMP,
        shift: DefaultInput.CROUCH
    },
    // Map how inputs relate to each other
    inputRelationships: {
        [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] },
        [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] },
        [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] },
        [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] },
        [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] },
        [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] },
        [DefaultInput.SPRINT]: { blockedBy: [DefaultInput.JUMP], overrides: [DefaultInput.CROUCH] },
        [DefaultInput.WALK]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT], overrides: [DefaultInput.CROUCH] },
        [DefaultInput.INTERACT]: { blockedBy: [DefaultInput.JUMP] }
    },
    // "Button behaviors" are called when button input is called (i.e. not axis input)
    inputButtonBehaviors: {
        [DefaultInput.JUMP]: {
            [BinaryValue$1.ON]: {
                behavior: jump,
                args: {}
            }
        },
        [DefaultInput.CROUCH]: {
            [BinaryValue$1.ON]: {
                behavior: addState,
                args: { state: DefaultStateTypes.CROUCHING }
            },
            [BinaryValue$1.OFF]: {
                behavior: removeState,
                args: { state: DefaultStateTypes.CROUCHING }
            }
        },
        [DefaultInput.SPRINT]: {
            [BinaryValue$1.ON]: {
                behavior: addState,
                args: { state: DefaultStateTypes.SPRINTING }
            },
            [BinaryValue$1.OFF]: {
                behavior: removeState,
                args: { state: DefaultStateTypes.SPRINTING }
            }
        }
    },
    // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
    inputAxisBehaviors: {
        [DefaultInput.MOVEMENT_PLAYERONE]: {
            behavior: move,
            args: {
                input: DefaultInput.MOVEMENT_PLAYERONE,
                inputType: InputType.TWOD
            }
        }
        // },
        // [DefaultInput.SCREENXY]: {
        //   behavior: console.log,
        //   args: {
        //     input: DefaultInput.LOOKTURN_PLAYERONE,
        //     inputType: InputType.TWOD
        //   }
    }
};

class InputSystem extends System$1 {
    execute(delta) {
        // Called when input component is added to entity
        this.queries.inputs.added.forEach(entity => {
            var _a;
            // Get component reference
            this._inputComponent = entity.getComponent(Input$1);
            // If input doesn't have a map, set the default
            if (this._inputComponent.map === undefined)
                this._inputComponent.map = DefaultInputMap;
            // Call all behaviors in "onAdded" of input map
            this._inputComponent.map.onAdded.forEach(behavior => {
                behavior.behavior(entity, Object.assign({}, behavior.args));
            });
            // Bind DOM events to event behavior
            (_a = Object.keys(this._inputComponent.map.eventBindings)) === null || _a === void 0 ? void 0 : _a.forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called when input component is removed from entity
        this.queries.inputs.removed.forEach(entity => {
            // Get component reference
            this._inputComponent = entity.getComponent(Input$1);
            // Call all behaviors in "onRemoved" of input map
            this._inputComponent.map.onRemoved.forEach(behavior => {
                behavior.behavior(entity, behavior.args);
            });
            // Unbind events from DOM
            Object.keys(this._inputComponent.map.eventBindings).forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called every frame on all input components
        this.queries.inputs.results.forEach(entity => handleInput(entity, delta));
    }
}
let input$3;
const handleInput = (entity, delta) => {
    input$3 = entity.getComponent(Input$1);
    input$3.data.forEach((value, key) => {
        if (value.type === InputType.BUTTON) {
            if (input$3.map.inputButtonBehaviors[key] && input$3.map.inputButtonBehaviors[key][value.value]) {
                input$3.map.inputButtonBehaviors[key][value.value].behavior(entity, input$3.map.inputButtonBehaviors[key][value.value].args, delta);
            }
        }
        else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED) {
            if (input$3.map.inputAxisBehaviors[key]) {
                input$3.map.inputButtonBehaviors[key][value.value].behavior(entity, input$3.map.inputAxisBehaviors[key].args, delta);
            }
        }
        else {
            console.error("handleInput called with an invalid input type");
        }
    });
    input$3.data.clear();
};
InputSystem.queries = {
    inputs: {
        components: [Input$1],
        listen: {
            added: true,
            removed: true
        }
    }
};

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

class Subscription extends BehaviorComponent {
}

class StateSystem extends System$1 {
    constructor() {
        super(...arguments);
        this.callBehaviors = (entity, args, delta) => {
            this._state = entity.getComponent(State);
            this._state.data.forEach((stateValue) => {
                if (this._state.map.states[stateValue.state] !== undefined && this._state.map.states[stateValue.state][args.phase] !== undefined) {
                    this._state.map.states[stateValue.state][args.phase].behavior(entity, this._state.map.states[stateValue.state][args.phase].args, delta);
                }
            });
        };
    }
    execute(delta, time) {
        var _a, _b;
        (_a = this.queries.state.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            // If stategroup has a default, add it to our state map
            this._state = entity.getComponent(State);
            Object.keys(this._state.map.groups).forEach((stateGroup) => {
                if (this._state.map.groups[stateGroup] !== undefined && this._state.map.groups[stateGroup].default !== undefined) {
                    addState(entity, { state: this._state.map.groups[stateGroup].default });
                    console.log("Added default state: " + this._state.map.groups[stateGroup].default);
                }
            });
        });
        (_b = this.queries.state.results) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            this.callBehaviors(entity, { phase: "onUpdate" }, delta);
            this.callBehaviors(entity, { phase: "onLateUpdate" }, delta);
        });
    }
}
StateSystem.queries = {
    state: {
        components: [State],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

const DEFAULT_OPTIONS$1 = {
    debug: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS$1, inputMap) {
    if (options.debug)
        console.log("Initializing input systems...");
    if (!isBrowser) {
        console.error("Couldn't initialize input, are you in a browser?");
        return null;
    }
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    world.registerSystem(InputSystem).registerSystem(StateSystem);
    world
        .registerComponent(Input$1)
        .registerComponent(State)
        .registerComponent(Actor)
        .registerComponent(Subscription)
        .registerComponent(TransformComponent);
    const inputSystemEntity = world
        .createEntity()
        .addComponent(Input$1)
        .addComponent(State)
        .addComponent(Actor)
        .addComponent(Subscription)
        .addComponent(TransformComponent);
    // Custom Action Map
    if (inputMap) {
        console.log("Using input map:");
        console.log(inputMap);
        inputSystemEntity.getMutableComponent(Input$1).map = inputMap;
    }
    else {
        console.log("No input map provided, defaulting to default input");
        inputSystemEntity.getMutableComponent(Input$1).map = DefaultInputMap;
    }
    // if (options.debug) {
    //   world.registerSystem(InputDebugSystem)
    //   console.log("INPUT: Registered input systems.")
    // }
    return world;
}

// Setup world
        const world = new World();

        // Test input
        const inputOptions = {
          debug: true
        };

      // TODO: Import input mapping
      // TODO: Modify some values
      // TODO: Pass to world

      initializeInputSystems(world, inputOptions);

      class InputVisualizer extends TagComponent {}

      class BaseDOMComponent extends Component {}
      BaseDOMComponent.schema = {
        value: { type: Types.Ref, default: null },
      };

      class ContainerDOMComponent extends BaseDOMComponent {}
      class ActionDOMComponent extends BaseDOMComponent {}
      class InputDOMComponent extends BaseDOMComponent {}

      world
        .registerComponent(InputVisualizer)
        .registerComponent(ContainerDOMComponent)
        .registerComponent(ActionDOMComponent)
        .registerComponent(InputDOMComponent);

      // DemoInputSystem
      class MouseVisualUpdateSystem extends System {
        // This method will get called on every frame by default
        execute(delta, time) {
          // Iterate through all the entities on the query
          this.queries.input.added.forEach(entity => {
            console.log('added!');
            const containerDiv = document.createElement('div');
            containerDiv.classList.add('mouse-container');
            const inputDiv = document.createElement('div');
            inputDiv.classList.add('mouse-input');
            inputDiv.textContent = '-';

            // const inputDiv = document.createElement('div')
            // inputDiv.classList.add('mouse-input')
            // inputDiv.textContent = '-: x---, y---'

            // containerDiv.appendChild(inputDiv)
            containerDiv.appendChild(inputDiv);
            document.body.appendChild(containerDiv);

            entity.addComponent(ContainerDOMComponent, { value: containerDiv });
            entity.addComponent(ActionDOMComponent, { value: inputDiv });
            entity.addComponent(InputDOMComponent, { value: inputDiv });
          });

          // cleanup of DOM
          this.queries.input.removed.forEach(entity => {
            const containerDomComponent = entity.getComponent(ContainerDOMComponent);
            if (containerDomComponent && containerDomComponent.value) {
              const container = containerDomComponent.value;

              const actionDomComponent = entity.getComponent(ActionDOMComponent);
              if (actionDomComponent && actionDomComponent.value) {
                container.removeChild(actionDomComponent.value);
              }
              const inputDomComponent = entity.getComponent(InputDOMComponent);
              if (inputDomComponent && inputDomComponent.value) {
                container.removeChild(inputDomComponent.value);
              }

              document.body.removeChild(container);
            }
          });

          this.queries.input.changed.forEach(entity => {
            const actionHandler = entity.getComponent(Input);
            const actionComponent = entity.getComponent(ActionDOMComponent);

            for (let i = 0; i < actionHandler.values.size; i++) {
              const input = actionHandler.values.get(i);

              // process input, in this case just update input div textContent
              if (input && actionComponent) {
                actionComponent.value.textContent = input.input + '-' + input.value;
              }
            }
            actionHandler.values.clear();

            const inputHandler = entity.getComponent(InputInputHandler2D);
            const lastInput = inputHandler.values.getLast();

            if (lastInput) {
              const inputDomComponent = entity.getComponent(InputDOMComponent);
              if (inputDomComponent) {
                inputDomComponent.value.textContent = lastInput.input + ': x' + lastInput.value.x + ' y' + lastInput.value.y;
              }
            }
          });
        }
      }

      // Define a query of entities that have "Velocity" and "Position" components
      MouseVisualUpdateSystem.queries = {
        input: {
          components: [ InputVisualizer, Input ],
          listen: {
            added: true,
            changed: true,
            removed: true
          }
        }
      };
      world.registerSystem(MouseVisualUpdateSystem);




      world
        .createEntity()
        .addComponent(InputVisualizer)
        .addComponent(Input);

        // Let's begin
        // Run!
        let lastTime = performance.now();
        function run() {
          // Compute delta and elapsed time
          const time = performance.now();
          const delta = time - lastTime;

          // Run all the systems
          world.execute(delta, time);

          lastTime = time;
          requestAnimationFrame(run);
        }

        run();
