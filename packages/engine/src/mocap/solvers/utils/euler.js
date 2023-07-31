/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


/** Euler rotation class. */
export default class Euler {
    constructor(a, b, c, rotationOrder) {
        var _a, _b, _c, _d;
        if (!!a && typeof a === "object") {
            this.x = (_a = a.x) !== null && _a !== void 0 ? _a : 0;
            this.y = (_b = a.y) !== null && _b !== void 0 ? _b : 0;
            this.z = (_c = a.z) !== null && _c !== void 0 ? _c : 0;
            this.rotationOrder = (_d = a.rotationOrder) !== null && _d !== void 0 ? _d : "XYZ";
            return;
        }
        this.x = a !== null && a !== void 0 ? a : 0;
        this.y = b !== null && b !== void 0 ? b : 0;
        this.z = c !== null && c !== void 0 ? c : 0;
        this.rotationOrder = rotationOrder !== null && rotationOrder !== void 0 ? rotationOrder : "XYZ";
    }
    /**
     * Multiplies a number to an Euler.
     * @param {number} a: Number to multiply
     */
    multiply(v) {
        return new Euler(this.x * v, this.y * v, this.z * v, this.rotationOrder);
    }
}
