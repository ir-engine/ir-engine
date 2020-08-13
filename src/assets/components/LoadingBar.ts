import { Component } from "../../ecs/Component"

export class LoadingBar extends Component<LoadingBar> {
  assetLoadedCallback: Function
  loadingCompleteCallback: Function
  progress = 0.0
}
