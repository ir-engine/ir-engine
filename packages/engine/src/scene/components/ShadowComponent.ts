import { Component } from '../../ecs/classes/Component';

export default class ShadowComponent extends Component<any> {
    castShadow: boolean;
    receiveShadow: boolean;
}
