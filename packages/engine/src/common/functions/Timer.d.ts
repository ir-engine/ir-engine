export declare function Timer(callbacks: {
    update?: Function;
    render?: Function;
}, step?: number): {
    start: Function;
    stop: Function;
};
