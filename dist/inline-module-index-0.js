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
System.isSystem = true;
function Not(Component) {
  return {
    operator: "not",
    Component: Component
  };
}

class TagComponent extends Component$1 {
  constructor() {
    super(false);
  }

}
TagComponent.isTagComponent = true;

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
const copyCopyable = (src, dest) => dest.copy(src);
const cloneClonable = src => src.clone();
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

const Actions = {
  DEFAULT: -1,
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
  SPRINT: 13
};

const Axes = {
  SCREENXY: 0,
  DPADONE: 1,
  DPADTWO: 2,
  DPADTHREE: 3,
  DPADFOUR: 4,
  MOVEMENT_IDLE: 0,
  MOVEMENT_WALKING_FORWARD: 11,
  MOVEMENT_JOGGING_FORWARD: 12,
  MOVEMENT_RUNNING_FORWARD: 13,
  MOVEMENT_WALKING_BACKWARD: 14,
  MOVEMENT_JOGGING_BACKWARD: 15,
  MOVEMENT_STRAFING_RIGHT: 16,
  MOVEMENT_STRAFING_LEFT: 17,
  MOVEMENT_RUNNING_BACKWARD: 18
};

const MouseInputActionMap = {
  0: Actions.PRIMARY,
  2: Actions.SECONDARY,
  1: Actions.INTERACT // Middle Mouse button

};
const MouseInputAxisMap = {
  mousePosition: Axes.SCREENXY
};

class MouseInput extends Component$1 {
  constructor() {
    super(...arguments);
    this.actionMap = MouseInputActionMap;
    this.axisMap = MouseInputAxisMap;
  }

}
MouseInput.schema = {
  actionMap: {
    type: Types$1.Ref,
    default: MouseInputActionMap
  },
  axisMap: {
    type: Types$1.Ref,
    default: MouseInputAxisMap
  },
  downHandler: {
    type: Types$1.Ref
  },
  moveHandler: {
    type: Types$1.Ref
  },
  upHandler: {
    type: Types$1.Ref
  }
};

var LifecycleValue;

(function (LifecycleValue) {
  LifecycleValue[LifecycleValue["STARTED"] = 1] = "STARTED";
  LifecycleValue[LifecycleValue["ENDED"] = 0] = "ENDED"; // off
})(LifecycleValue || (LifecycleValue = {}));

var LifecycleValue$1 = LifecycleValue;

class RingBuffer {
  constructor(size) {
    this.buffer = [];
    this.pos = 0;
    console.log("Constructing ring buffer");

    if (size < 0) {
      throw new RangeError("The size does not allow negative values.");
    }

    this.size = size;
  }

  static fromArray(data, size = 0) {
    const actionBuffer = new RingBuffer(size);
    actionBuffer.fromArray(data, size === 0);
    return actionBuffer;
  }

  copy() {
    const newAxisBuffer = new RingBuffer(this.getBufferLength());
    newAxisBuffer.buffer = this.buffer;
    return newAxisBuffer;
  }

  clone() {
    const newAxisBuffer = new RingBuffer(this.getBufferLength());
    newAxisBuffer.buffer = this.buffer;
    return newAxisBuffer;
  }

  getSize() {
    return this.size;
  }

  getPos() {
    return this.pos;
  }

  getBufferLength() {
    return this.buffer.length;
  }

  add(...items) {
    items.forEach(item => {
      this.buffer[this.pos] = item;
      this.pos = (this.pos + 1) % this.size;
    });
  }

  get(index) {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return undefined;
    }

    if (this.buffer.length < this.size) {
      return this.buffer[index];
    }

    return this.buffer[(this.pos + index) % this.size];
  }

  getFirst() {
    return this.get(0);
  }

  getLast() {
    return this.get(-1);
  }

  remove(index, count = 1) {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return [];
    }

    const arr = this.toArray();
    const removedItems = arr.splice(index, count);
    this.fromArray(arr);
    return removedItems;
  }

  pop() {
    return this.remove(0)[0];
  }

  popLast() {
    return this.remove(-1)[0];
  }

  toArray() {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos));
  }

  fromArray(data, resize = false) {
    if (!Array.isArray(data)) {
      throw new TypeError("Input value is not an array.");
    }

    if (resize) this.resize(data.length);
    if (this.size === 0) return;
    this.buffer = data.slice(-this.size);
    this.pos = this.buffer.length % this.size;
  }

  clear() {
    this.buffer = [];
    this.pos = 0;
  }

  resize(newSize) {
    if (newSize < 0) {
      throw new RangeError("The size does not allow negative values.");
    }

    if (newSize === 0) {
      this.clear();
    } else if (newSize !== this.size) {
      const currentBuffer = this.toArray();
      this.fromArray(currentBuffer.slice(-newSize));
      this.pos = this.buffer.length % newSize;
    }

    this.size = newSize;
  }

  full() {
    return this.buffer.length === this.size;
  }

  empty() {
    return this.buffer.length === 0;
  }

}

class InputActionHandler extends Component$1 {
  constructor() {
    super(...arguments);
    this.queue = new RingBuffer(10);
    this.schema = {
      queue: {
        type: ActionBufferType
      }
    };
  }

}
const ActionBufferType = createType$1({
  name: "ActionBuffer",
  default: new RingBuffer(10),
  copy: copyCopyable,
  clone: cloneClonable
});

// Should be a singleton, we only need one in our world
class UserInput extends TagComponent {}

class InputAxisHandler2D extends Component$1 {
  constructor() {
    super(...arguments);
    this.queue = new RingBuffer(10);
    this.schema = {
      queue: {
        type: AxisBufferType
      }
    };
  }

}
const AxisBufferType = createType$1({
  name: "ActionBuffer",
  default: new RingBuffer(10),
  copy: copyCopyable,
  clone: cloneClonable
});

const keys = {
  37: 1,
  38: 1,
  39: 1,
  40: 1
};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
} // modern Chrome requires { passive: false } when adding event


let supportsPassive = false;

try {
  window.addEventListener("test", null, Object.defineProperty({}, "passive", {
    get: function () {
      supportsPassive = true;
    }
  })); // eslint-disable-next-line no-empty
} catch (e) {}

const wheelOpt = supportsPassive ? {
  passive: false
} : false;
const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel"; // call this to Disable

function disableScroll() {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF

  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop

  window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile

  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
} // call this to Enable

function enableScroll() {
  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault);
  window.removeEventListener("touchmove", preventDefault);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

class MouseInputSystem extends System {
  constructor() {
    super(...arguments);

    this.moveHandler = (e, entity) => {
      entity.getComponent(InputAxisHandler2D).queue.add({
        axis: this._mouse.getComponent(MouseInput).axisMap.mousePosition,
        value: {
          x: e.clientX,
          y: e.clientY
        }
      });
    };

    this.buttonHandler = (e, entity, value) => {
      if (!this._mouse || this._mouse.getComponent(MouseInput).actionMap[e.button] === undefined) return;
      entity.getMutableComponent(InputActionHandler).queue.add({
        action: this._mouse.getComponent(MouseInput).actionMap[e.button],
        value: value
      });
    };
  }

  execute() {
    this.queries.axis.added.forEach(ent => {
      this._mouse = ent;
      document.addEventListener("mousemove", e => this._mouse.getMutableComponent(MouseInput).moveHandler = this.moveHandler(e, ent), false);
    });
    this.queries.buttons.added.forEach(ent => {
      this._mouse = ent;
      document.addEventListener("contextmenu", event => event.preventDefault());
      disableScroll();
      document.addEventListener("mousedown", e => this._mouse.getMutableComponent(MouseInput).downHandler = this.buttonHandler(e, ent, LifecycleValue$1.STARTED), false);
      document.addEventListener("mouseup", e => this._mouse.getMutableComponent(MouseInput).upHandler = this.buttonHandler(e, ent, LifecycleValue$1.ENDED), false);
    });
    this.queries.axis.removed.forEach(() => {
      if (this._mouse) document.removeEventListener("mousemove", this._mouse.getMutableComponent(MouseInput).moveHandler);
    });
    this.queries.buttons.removed.forEach(() => {
      document.removeEventListener("contextmenu", event => event.preventDefault());
      enableScroll();

      if (this._mouse) {
        document.removeEventListener("mousedown", this._mouse.getMutableComponent(MouseInput).downHandler);
        document.removeEventListener("mouseup", this._mouse.getMutableComponent(MouseInput).upHandler);
      }
    });
  }

}
MouseInputSystem.queries = {
  buttons: {
    components: [MouseInput, InputActionHandler, UserInput],
    listen: {
      added: true,
      removed: true
    }
  },
  axis: {
    components: [MouseInput, InputAxisHandler2D, UserInput],
    listen: {
      added: true,
      removed: true
    }
  }
};

const KeyboardInputMap = {
  w: Actions.FORWARD,
  a: Actions.LEFT,
  s: Actions.RIGHT,
  d: Actions.BACKWARD
};

class KeyboardInput extends Component$1 {
  constructor() {
    super(...arguments);
    this.inputMap = KeyboardInputMap;
  }

}
KeyboardInput.schema = {
  inputMap: {
    type: Types$1.Ref,
    default: KeyboardInputMap
  }
};

class KeyboardInputSystem extends System {
  execute() {
    // Query for user action queue
    this.queries.keyboard.added.forEach(entity => {
      document.addEventListener("keydown", e => {
        if (e.repeat) return;
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.STARTED);
      });
      document.addEventListener("keyup", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.ENDED);
      });
    });
    this.queries.keyboard.removed.forEach(entity => {
      document.removeEventListener("keydown", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.STARTED);
      });
      document.removeEventListener("keyup", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.ENDED);
      });
    });
  }

  mapKeyToAction(entity, key, value) {
    this._kb = entity.getComponent(KeyboardInput);
    if (this._kb.inputMap[key] === undefined) return; // Add to action queue

    entity.getMutableComponent(InputActionHandler).queue.add({
      action: this._kb.inputMap[key],
      value: value
    });
  }

}
KeyboardInputSystem.queries = {
  keyboard: {
    components: [KeyboardInput, InputActionHandler, UserInput],
    listen: {
      added: true,
      removed: true
    }
  }
};

class GamepadInput extends Component$1 {}
GamepadInput.schema = {
  threshold: {
    type: Types$1.Number,
    default: 0.1
  },
  connected: {
    type: Types$1.Boolean,
    default: false
  },
  dpadOne: {
    type: Types$1.Number
  },
  dpadTwo: {
    type: Types$1.Number
  },
  buttonA: {
    type: Types$1.Boolean
  },
  buttonB: {
    type: Types$1.Boolean
  },
  buttonX: {
    type: Types$1.Boolean
  },
  buttonY: {
    type: Types$1.Boolean
  }
};

class GamepadInputSystem extends System {
  execute() {
    this.queries.gamepad.added.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput);
      window.addEventListener("gamepadconnected", event => {
        console.log("A gamepad connected:", event.gamepad);
        gp.connected = true;
      });
      window.addEventListener("gamepaddisconnected", event => {
        console.log("A gamepad disconnected:", event.gamepad);
        gp.connected = false;
      });
    });
    this.queries.gamepad.results.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput);

      if (gp.connected) {
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < gamepads.length; i++) {// if (gamepads[i].axes && gamepads[i].axes.length >= 2) {
          //   // X Axis
          //   if (gamepads[i].axes[0] < -gp.threshold || gamepads[i].axes[0] > gp.threshold) {
          //     if (i == 0) gp.dpadOneAxisX = gamepads[i].axes[0]
          //     else if (i == 1) gp.dpadTwoAxisX = gamepads[i].axes[0]
          //   }
          //   if (gamepads[i].axes[1] < -gp.threshold || gamepads[i].axes[1] > gp.threshold) {
          //     if (i == 0) gp.dpadOneAxisY = gamepads[i].axes[1]
          //     else if (i == 1) gp.dpadTwoAxisY = gamepads[i].axes[1]
          //   }
          // }
        }
      }
    });
  }

}
GamepadInputSystem.queries = {
  gamepad: {
    components: [GamepadInput],
    listen: {
      added: true,
      removed: true
    }
  }
};

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

// Place this component on any entity which you would like to recieve input
class InputReceiver extends TagComponent {}

class InputDebugSystem extends System {
  execute() {
    this.queries.actionReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputActionHandler).queue.getBufferLength() > 0) {
        entity.getComponent(InputActionHandler).queue.toArray().forEach(element => {
          console.log(element);
          this._actionDataUIElement = document.getElementById("actionData");

          if (this._actionDataUIElement !== undefined) {
            this._actionDataUIElement.innerHTML = entity.getComponent(InputActionHandler).queue.toArray()[0].action + " | " + entity.getComponent(InputActionHandler).queue.toArray()[0].value;
          }
        });
      }
    });
    this.queries.axisReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).queue.getBufferLength() > 0) console.log("Axes: " + entity.getComponent(InputAxisHandler2D).queue.getBufferLength());
      this._axisDataUIElement = document.getElementById("axisData");

      if (this._axisDataUIElement !== undefined) {
        this._axisDataUIElement.innerHTML = entity.getComponent(InputAxisHandler2D).queue.toArray()[0].axis + " | x: " + entity.getComponent(InputAxisHandler2D).queue.toArray()[0].value.x + " | y: " + entity.getComponent(InputAxisHandler2D).queue.toArray()[0].value.y;
      }
    });
  }

}
InputDebugSystem.queries = {
  actionReceivers: {
    components: [InputReceiver, InputActionHandler, Not(UserInput)],
    listen: {
      changed: true
    }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler2D, Not(UserInput)],
    listen: {
      changed: true
    }
  }
};

const ActionMap = {
  [Actions.FORWARD]: {
    opposes: [Actions.BACKWARD]
  },
  [Actions.BACKWARD]: {
    opposes: [Actions.FORWARD]
  },
  [Actions.LEFT]: {
    opposes: [Actions.RIGHT]
  },
  [Actions.RIGHT]: {
    opposes: [Actions.LEFT]
  }
};

class InputActionMapData extends Component$1 {
  constructor() {
    super(...arguments);
    this.actionMap = ActionMap;
  }

}
InputActionMapData.schema = {
  data: {
    type: Types$1.Ref,
    default: ActionMap
  }
};

class InputActionSystem extends System {
  constructor() {
    super(...arguments);
    this._actionMap = ActionMap;
  }

  execute() {
    this.queries.actionMapData.added.forEach(entity => {
      console.log("map data added");
      this._actionMap = entity.getComponent(InputActionMapData).actionMap;
    }); // // Set action queue

    this.queries.userInputActionQueue.added.forEach(input => {
      this._userInputActionQueue = input.getComponent(InputActionHandler);
    });
    if (this._userInputActionQueue.queue.getBufferLength() < 1) return;
    this.queries.actionReceivers.results.forEach(receiver => {
      if (receiver.getComponent(InputActionHandler).queue.getBufferLength() > 0) {
        receiver.getMutableComponent(InputActionHandler).queue.clear();
      }

      this.applyInputToListener(this._userInputActionQueue, receiver);
    });

    this._userInputActionQueue.queue.clear();
  }

  validateActions(actionHandler) {
    if (!this._actionMap) return;
    const actionQueueArray = actionHandler.getComponent(InputActionHandler).queue.toArray();

    for (let i = 0; i < actionQueueArray.length; i++) {
      for (let k = 0; k < actionQueueArray.length; k++) {
        if (i == k) continue; // don't compare to self
        // Opposing actions cancel out

        if (this.actionsOpposeEachOther(actionQueueArray, i, k)) {
          actionHandler.getMutableComponent(InputActionHandler).queue.remove(i);
          actionHandler.getMutableComponent(InputActionHandler).queue.remove(k);
        } // If action is blocked by another action that overrides and is active, remove this action
        else if (this.actionIsBlockedByAnother(actionQueueArray, i, k)) {
            actionHandler.getMutableComponent(InputActionHandler).queue.remove(i);
          } // Override actions override
          else if (this.actionOverridesAnother(actionQueueArray, i, k)) {
              actionHandler.getMutableComponent(InputActionHandler).queue.remove(k);
            }
      }
    }
  } // If they oppose, cancel them


  actionsOpposeEachOther(actionQueueArray, arrayPosOne, arrayPoseTwo) {
    var _a, _b;

    const actionToTest = actionQueueArray[arrayPosOne];
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
    (_b = (_a = this._actionMap[actionToTest.action]) === null || _a === void 0 ? void 0 : _a.opposes) === null || _b === void 0 ? void 0 : _b.forEach(action => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true;
      }
    });
    return false;
  }

  actionIsBlockedByAnother(actionQueueArray, arrayPosOne, arrayPoseTwo) {
    var _a, _b;

    const actionToTest = actionQueueArray[arrayPosOne];
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
    (_b = (_a = this._actionMap[actionToTest.action]) === null || _a === void 0 ? void 0 : _a.blockedBy) === null || _b === void 0 ? void 0 : _b.forEach(action => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true;
      }
    });
    return false;
  }

  actionOverridesAnother(actionQueueArray, arrayPosOne, arrayPoseTwo) {
    var _a, _b;

    const actionToTest = actionQueueArray[arrayPosOne];
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
    (_b = (_a = this._actionMap[actionToTest.action]) === null || _a === void 0 ? void 0 : _a.overrides) === null || _b === void 0 ? void 0 : _b.forEach(action => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        return true;
      }
    });
    return false;
  }

  applyInputToListener(userInputActionQueue, listenerActionQueue) {
    // If action exists, but action state is different, update action InputActionHandler
    userInputActionQueue.queue.toArray().forEach(userInput => {
      this._skip = false;
      listenerActionQueue.getComponent(InputActionHandler).queue.toArray().forEach((listenerAction, listenerIndex) => {
        // Skip action since it's already in the listener queue
        if (userInput.action === listenerAction.action && userInput.value === listenerAction.value) {
          this._skip = true;
        } else if (userInput.action === listenerAction.action && userInput.value !== listenerAction.value && userInput.value !== undefined) {
          listenerActionQueue.getMutableComponent(InputActionHandler).queue.remove(listenerIndex);
          listenerActionQueue.getMutableComponent(InputActionHandler).queue.add(userInput);
          this._skip = true;
        }
      });

      if (!this._skip) {
        listenerActionQueue.getMutableComponent(InputActionHandler).queue.add(userInput);
      }
    }); // If action exists, but action state is same, do nothing

    this.validateActions(listenerActionQueue);
  }

}
InputActionSystem.queries = {
  userInputActionQueue: {
    components: [UserInput, InputActionHandler],
    listen: {
      added: true,
      changed: true
    }
  },
  actionReceivers: {
    components: [InputReceiver, InputActionHandler, Not(UserInput)]
  },
  actionMapData: {
    components: [InputActionMapData, UserInput],
    listen: {
      added: true
    }
  }
};

class InputAxisSystem extends System {
  execute() {
    this.queries.userInputAxisQueue.added.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(InputAxisHandler2D);
    }); // If the queue hasn't been set yet, or the queue length is 0

    if (!this._userInputAxisQueue || this._userInputAxisQueue.queue.getBufferLength() < 1) {
      return;
    }

    this.queries.axisReceivers.results.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).queue.getBufferLength() > 0) {
        entity.getMutableComponent(InputAxisHandler2D).queue.clear();
      }

      if (this._userInputAxisQueue.queue.getBufferLength() > 0) {
        this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(InputAxisHandler2D));
      }
    }); // Clear all axis

    this._userInputAxisQueue.queue.clear();
  }

  applyInputToListener(userInputAxisQueue, listenerAxisQueue) {
    // If axis exists, but axis state is different, update axis state
    userInputAxisQueue.queue.toArray().forEach(userInput => {
      let skip = false;
      listenerAxisQueue.queue.toArray().forEach((listenerAxis, listenerIndex) => {
        // Skip axis since it's already in the listener queue
        if (userInput.axis === listenerAxis.axis && userInput.value === listenerAxis.value) {
          skip = true;
        } else if (userInput.axis === listenerAxis.axis && userInput.value !== listenerAxis.value) {
          // Axis value updated, so skip ading to queue
          listenerAxisQueue.queue.get(listenerIndex).value = userInput.value;
          skip = true;
        }
      });
      if (!skip) listenerAxisQueue.queue.add(userInput);
    });
  }

}
InputAxisSystem.queries = {
  userInputAxisQueue: {
    components: [UserInput, InputAxisHandler2D],
    listen: {
      added: true
    }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler2D, Not(UserInput)]
  }
};

const DEFAULT_OPTIONS$1 = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS$1, keyboardInputMap, mouseInputMap, // mobileInputMap?,
// VRInputMap?,
actionMap) {
  if (options.debug) console.log("Initializing input systems...");
  if (!isBrowser) return console.error("Couldn't initialize input, are you in a browser?");

  if (options.debug) {
    console.log("Registering input systems with the following options:");
    console.log(options);
  }

  world.registerSystem(InputActionSystem).registerSystem(InputAxisSystem);
  world.registerComponent(UserInput).registerComponent(InputActionHandler).registerComponent(InputAxisHandler2D).registerComponent(InputReceiver).registerComponent(InputActionMapData);
  if (options.keyboard) world.registerSystem(KeyboardInputSystem).registerComponent(KeyboardInput);
  if (options.mouse) world.registerSystem(MouseInputSystem).registerComponent(MouseInput);
  if (options.gamepad) world.registerSystem(GamepadInputSystem).registerComponent(GamepadInput); // TODO: VR, Mobile

  const inputSystemEntity = world.createEntity().addComponent(UserInput).addComponent(InputActionHandler).addComponent(InputAxisHandler2D).addComponent(InputActionMapData).addComponent(InputReceiver);
  const inputReceiverEntity = world.createEntity().addComponent(InputReceiver).addComponent(InputActionHandler).addComponent(InputAxisHandler2D); // Custom Action Map

  if (actionMap) {
    inputSystemEntity.getMutableComponent(InputActionMapData).actionMap = actionMap;
  }

  if (options.keyboard) {
    inputSystemEntity.addComponent(KeyboardInput);

    if (keyboardInputMap) {
      inputSystemEntity.getMutableComponent(KeyboardInput).inputMap = keyboardInputMap;
    }

    console.log("Registered KeyboardInputSystem and added KeyboardInput component to input entity");
  }

  if (options.mouse) {
    inputSystemEntity.addComponent(MouseInput);

    if (mouseInputMap) {
      inputSystemEntity.getMutableComponent(MouseInput).actionMap = mouseInputMap;
    }

    if (options.debug) console.log("Registered MouseInputSystem and added MouseInput component to input entity");
  }

  if (options.gamepad) {
    inputSystemEntity.addComponent(GamepadInput); // TODO: Initialize with user mappings

    if (options.debug) console.log("Registered GamepadInputSystem and added MouseInput component to input entity");
  } // TODO: Add touchscreen


  if (options.touchscreen) {
    // world.registerSystem(TouchscreenInputSystem, null)
    // inputSystemEntity.addComponent(TouchscreenInput)
    if (options.debug) {
      console.log("Touchscreen is not yet implemented");
    }
  }

  if (options.debug) {
    world.registerSystem(InputDebugSystem);
    console.log("INPUT: Registered input systems.");
  }
}

const world = new World();

      const inputOptions = {
        mouse: true,
        keyboard: true,
        touchscreen: true,
        gamepad: true,
        debug: true
      };
      initializeInputSystems(world, inputOptions);

      var lastTime = performance.now();
      function update() {
        var time = performance.now();
        var delta = time - lastTime;
        lastTime = time;
        world.execute(delta);
        requestAnimationFrame(update);
      }
      
      update();
