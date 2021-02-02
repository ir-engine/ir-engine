export const elementPlaying = (element: HTMLMediaElement): boolean => {
    return element && (!!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2));
};