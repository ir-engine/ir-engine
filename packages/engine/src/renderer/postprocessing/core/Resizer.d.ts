import { Vector2 } from 'three';
/**
 * A resizer that can be used to store a base and a target resolution.
 *
 * The attached resizeable will be updated with the base resolution when the
 * target resolution changes. The new calculated resolution can then be
 * retrieved via {@link Resizer.width} and {@link Resizer.height}.
 */
export declare class Resizer {
    resizable: any;
    base: Vector2;
    target: Vector2;
    s: number;
    /**
       * Constructs a new resizer.
       *
       * @param {Resizable} resizeable - A resizable object.
       * @param {Number} [width=Resizer.AUTO_SIZE] - The width.
       * @param {Number} [height=Resizer.AUTO_SIZE] - The height.
       * @param {Number} [scale=1.0] - An alternative resolution scale.
       */
    constructor(resizable: any, width?: number, height?: number, scale?: number);
    /**
       * The current resolution scale.
       *
       * @type {Number}
       */
    get scale(): number;
    /**
       * Sets the resolution scale.
       *
       * Also sets the width and height to {@link Resizer.AUTO_SIZE}.
       *
       * @type {Number}
       */
    set scale(value: number);
    /**
       * The calculated width.
       *
       * If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
       * base width will be returned.
       *
       * @type {Number}
       */
    get width(): any;
    /**
       * Sets the target width.
       *
       * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based
       * on the height and the original aspect ratio.
       *
       * @type {Number}
       */
    set width(value: any);
    /**
       * The calculated height.
       *
       * If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
       * base height will be returned.
       *
       * @type {Number}
       */
    get height(): any;
    /**
       * Sets the target height.
       *
       * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based
       * on the width and the original aspect ratio.
       *
       * @type {Number}
       */
    set height(value: any);
    /**
       * An auto sizing constant.
       *
       * Can be used to automatically calculate the width or height based on the
       * original aspect ratio.
       *
       * @type {Number}
       */
    static get AUTO_SIZE(): number;
}
