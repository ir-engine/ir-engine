/**
 * An object selection.
 *
 * Object selections use render layers to facilitate quick and efficient
 * visibility changes.
 */
export declare class Selection extends Set {
    currentLayer: number;
    /**
       * Constructs a new selection.
       *
       * @param {Iterable<Object3D>} [iterable] - A collection of objects that should be added to this selection.
       * @param {Number} [layer=10] - A dedicated render layer for selected objects.
       */
    constructor(iterable?: any, layer?: number);
    /**
       * A dedicated render layer for selected objects.
       *
       * This layer is set to 10 by default. If this collides with your own custom
       * layers, please change it to a free layer before rendering!
       *
       * @type {Number}
       */
    get layer(): number;
    /**
       * Sets the render layer of selected objects.
       *
       * The current selection will be updated accordingly.
       *
       * @type {Number}
       */
    set layer(value: number);
    /**
       * Clears this selection.
       *
       * @return {Selection} This selection.
       */
    clear(): void;
    /**
       * Clears this selection and adds the given objects.
       *
       * @param {Iterable<Object3D>} objects - The objects that should be selected. This array will be copied.
       * @return {Selection} This selection.
       */
    set(objects: any): this;
    /**
       * An alias for {@link has}.
       *
       * @param {Object3D} object - An object.
       * @return {Number} Returns 0 if the given object is currently selected, or -1 otherwise.
       * @deprecated Added for backward compatibility. Use has instead.
       */
    indexOf(object: any): 0 | -1;
    /**
       * Adds an object to this selection.
       *
       * @param {Object3D} object - The object that should be selected.
       * @return {Selection} This selection.
       */
    add(object: any): this;
    /**
       * Removes an object from this selection.
       *
       * @param {Object3D} object - The object that should be deselected.
       * @return {Boolean} Returns true if an object has successfully been removed from this selection; otherwise false.
       */
    delete(object: any): boolean;
    /**
       * Sets the visibility of all selected objects.
       *
       * This method enables or disables render layer 0 of all selected objects.
       *
       * @param {Boolean} visible - Whether the selected objects should be visible.
       * @return {Selection} This selection.
       */
    setVisible(visible: any): this;
}
