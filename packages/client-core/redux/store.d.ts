declare const store: import("redux").Store<{
    admin: any;
    app: any;
    auth: any;
    chat: any;
    friends: any;
    groups: any;
    party: any;
    instanceConnection: any;
    invite: any;
    locations: any;
    feeds: any;
    feedFires: any;
    videos: any;
    scenes: any;
    alert: any;
    dialog: any;
    devicedetect: unknown;
    user: any;
}, import("redux").Action<any>> & {
    dispatch: unknown;
};
export declare function configureStore(): import("redux").Store<{
    admin: any;
    app: any;
    auth: any;
    chat: any;
    friends: any;
    groups: any;
    party: any;
    instanceConnection: any;
    invite: any;
    locations: any;
    feeds: any;
    feedFires: any;
    videos: any;
    scenes: any;
    alert: any;
    dialog: any;
    devicedetect: unknown;
    user: any;
}, import("redux").Action<any>> & {
    dispatch: unknown;
};
export default store;
