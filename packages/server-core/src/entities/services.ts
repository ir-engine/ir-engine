import { Application } from '../../declarations';

// Types
import ComponentType from './component-type/component-type.service';
import CollectionType from './collection-type/collection-type.service';

// Objects
import Collection from './collection/collection.service';
import Component from './component/component.service';
import Entity from './entity/entity.service';

export default [
  CollectionType,
  ComponentType,
  Collection,
  Component,
  Entity
]
