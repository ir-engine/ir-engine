/**

  QuickHull
  ---------

  The MIT License

  Copyright &copy; 2010-2014 three.js authors

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

  THE SOFTWARE.


    @author mark lundin / http://mark-lundin.com

    This is a 3D implementation of the Quick Hull algorithm.
    It is a fast way of computing a convex hull with average complexity
    of O(n log(n)).
    It uses depends on three.js and is supposed to create THREE.Geometry.

    It's also very messy

 */
import * as THREE from 'three';
import { BufferGeometry } from 'three';
export declare const quickhull: (geometry: BufferGeometry) => THREE.BufferGeometry;
