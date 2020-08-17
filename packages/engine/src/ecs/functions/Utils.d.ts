/**
 * Return the name of a component
 * @param {Component} Component
 * @private
 */
export declare function getName(Component: any): any;
/**
 * Return a valid property name for the Component
 * @param {Component} Component
 * @private
 */
export declare function componentPropertyName(Component: any): any;
/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */
export declare function queryKey(Components: any): string;
export declare const hasWindow: boolean;
export declare const now: any;
export declare function componentRegistered(T: any): boolean;
