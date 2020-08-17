import { Component } from "../../ecs/classes/Component";
export declare class LoadingBar extends Component<LoadingBar> {
    assetLoadedCallback: Function;
    loadingCompleteCallback: Function;
    progress: number;
}
