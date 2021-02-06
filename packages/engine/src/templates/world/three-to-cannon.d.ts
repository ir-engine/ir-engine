/**
 * Given a Object3D instance, creates a corresponding CANNON shape.
 * @param  {Object3D} object
 * @return {CANNON.Shape}
 */
export declare const threeToCannon: {
    (object: any, options: any): any;
    Type: {
        BOX: string;
        CYLINDER: string;
        SPHERE: string;
        HULL: string;
        MESH: string;
    };
};
