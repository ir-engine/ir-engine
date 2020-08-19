import { Component } from '../../ecs/classes/Component';

export class LoadingBar extends Component<LoadingBar> {
  assetLoadedCallback: Function
  loadingCompleteCallback: Function
  progress = 0.0
}
