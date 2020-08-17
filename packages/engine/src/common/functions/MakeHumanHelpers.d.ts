/**
 * Helper functions
 * @author          wassname
 */
/**
 * inverts a object by many values
 * e.g. invertByMany({ 'a': [1,2,3], 'b': [1], c:[2]})
 * // {"1":["a","b"],"2":["a","c"],"3":["a"]}
 **/
export declare function invertByMany(dataObj: any): any;
/**
 * inverts a object by many unique values
 * inveryByUniqueValues({ 'a': [1,2], 'b': [3], c:[4]})
 * // {1: "a", 2: "a", 3: "b", 4:"c"}
 */
export declare function invertByUniqueValues(dataObj: any): any;
/**
 * remap property name and values using lodash
 * ref: http://stackoverflow.com/a/37389070/221742
 * @param  {Object} object         - e.g. {oldKey:'oldValue''}
 * @param  {Object} keyMapping   - {oldKey:'newKey'}
 * @param  {Object} valueMapping - {oldValue:'newValue'}
 * @return {Object}              - {newKey:'newValue'}
 */
export declare function remapKeyValues(currentObject: any, keyMapping: any, valueMapping: any): {
    [x: string]: any;
};
/**
 * deep remap property name and values using lodash
 * @param  {Object} object         - e.g. {oldKey:{oldKey:'oldValue'}}
 * @param  {Object} keyMapping   - {oldKey:'newKey'}
 * @param  {Object} valueMapping - {oldValue:'newValue'}
 * @return {Object}              - {newKey:{newKey:'newValue'}}
 */
export declare function remapKeyValuesDeep(currentObject: any, keyMapping: any, valueMapping: any): any;
export declare function deepRoundValues(currentObject: any, roundFunc?: (v: any) => number): {
    [x: string]: any;
};
export declare function deepParseFloat(currentObject: any): any;
