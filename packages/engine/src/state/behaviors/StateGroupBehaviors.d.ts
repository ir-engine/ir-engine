import { StateGroupAlias } from "../types/StateGroupAlias";
import { Component } from "../../ecs/classes/Component";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
export declare const componentsFromStateGroupExist: Behavior;
export declare const removeComponentsFromStateGroup: Behavior;
export declare const getComponentsFromStateGroup: (entity: Entity, args: {
    group: StateGroupAlias;
}) => Component<any>[];
export declare const getComponentFromStateGroup: (entity: Entity, args: {
    stateGroupType: StateGroupAlias;
}) => Component<any> | null;
