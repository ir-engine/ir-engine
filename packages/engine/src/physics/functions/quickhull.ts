// @ts-nocheck

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
import * as THREE from 'three'
import { BufferAttribute, BufferGeometry } from 'three'

/* tslint:disable */
export const quickhull = (function () {
  let faces = []
  let faceStack = []
  let NUM_POINTS, dcur, j, v0, v1, v2, v3, N, D

  let ab, ac, ax, suba, subb, normal, diff, subaA, subaB, subC, cEdgeIndex

  function reset() {
    ;(ab = new THREE.Vector3()),
      (ac = new THREE.Vector3()),
      (ax = new THREE.Vector3()),
      (suba = new THREE.Vector3()),
      (subb = new THREE.Vector3()),
      (normal = new THREE.Vector3()),
      (diff = new THREE.Vector3()),
      (subaA = new THREE.Vector3()),
      (subaB = new THREE.Vector3()),
      (subC = new THREE.Vector3())
  }

  //temporary vectors

  function process(points) {
    // Iterate through all the faces and remove
    while (faceStack.length > 0) {
      cull(faceStack.shift(), points)
    }
  }

  const norm = (function () {
    const ca = new THREE.Vector3(),
      ba = new THREE.Vector3(),
      N = new THREE.Vector3()

    return function (a, b, c) {
      ca.subVectors(c, a)
      ba.subVectors(b, a)

      N.crossVectors(ca, ba)

      return N.normalize()
    }
  })()

  function getNormal(face, points) {
    if (face.normal !== undefined) return face.normal

    const p0 = points[face[0]],
      p1 = points[face[1]],
      p2 = points[face[2]]

    ab.subVectors(p1, p0)
    ac.subVectors(p2, p0)
    normal.crossVectors(ac, ab)
    normal.normalize()

    return (face.normal = normal.clone())
  }

  function assignPoints(face, pointset, points) {
    // ASSIGNING POINTS TO FACE
    const p0 = points[face[0]]
    const dots = []
    const norm = getNormal(face, points)

    // Sory all the points by there distance from the plane
    pointset.sort((aItem, bItem) => {
      dots[aItem.x / 3] = dots[aItem.x / 3] !== undefined ? dots[aItem.x / 3] : norm.dot(suba.subVectors(aItem, p0))
      dots[bItem.x / 3] = dots[bItem.x / 3] !== undefined ? dots[bItem.x / 3] : norm.dot(subb.subVectors(bItem, p0))

      return dots[aItem.x / 3] - dots[bItem.x / 3]
    })

    //TODO :: Must be a faster way of finding and index in this array
    let index = pointset.length

    if (index === 1) dots[pointset[0].x / 3] = norm.dot(suba.subVectors(pointset[0], p0))
    while (index-- > 0 && dots[pointset[index].x / 3] > 0)
      if (index + 1 < pointset.length && dots[pointset[index + 1].x / 3] > 0) {
        face.visiblePoints = pointset.splice(index + 1)
      }
  }

  function cull(face, points) {
    let i = faces.length,
      dot,
      currentFace
    const visibleFaces = [face]

    const apex = points.indexOf(face.visiblePoints.pop())

    // Iterate through all other faces...
    while (i-- > 0) {
      currentFace = faces[i]
      if (currentFace !== face) {
        // ...and check if they're pointing in the same direction
        dot = getNormal(currentFace, points).dot(diff.subVectors(points[apex], points[currentFace[0]]))
        if (dot > 0) {
          visibleFaces.push(currentFace)
        }
      }
    }

    // Determine Perimeter - Creates a bounded horizon

    // 1. Pick an edge A out of all possible edges
    // 2. Check if A is shared by any other face. a->b === b->a
    // 2.1 for each edge in each triangle, isShared = ( f1.a == f2.a && f1.b == f2.b ) || ( f1.a == f2.b && f1.b == f2.a )
    // 3. If not shared, then add to convex horizon set,
    //pick an end point (N) of the current edge A and choose a new edge NA connected to A.
    //Restart from 1.
    // 4. If A is shared, it is not an horizon edge, therefore flag both faces that share this edge as candidates for culling
    // 5. If candidate geometry is a degenrate triangle (ie. the tangent space normal cannot be computed) then remove that triangle from all further processing

    let j = (i = visibleFaces.length)
    const hasOneVisibleFace = i === 1
    let perimeter = [],
      edgeIndex = 0,
      compareFace,
      nextIndex,
      a,
      b

    let allPoints = []
    const originFace = [
      visibleFaces[0][0],
      visibleFaces[0][1],
      visibleFaces[0][1],
      visibleFaces[0][2],
      visibleFaces[0][2],
      visibleFaces[0][0]
    ]

    if (visibleFaces.length === 1) {
      currentFace = visibleFaces[0]

      perimeter = [currentFace[0], currentFace[1], currentFace[1], currentFace[2], currentFace[2], currentFace[0]]
      // remove visible face from list of faces
      if (faceStack.indexOf(currentFace) > -1) {
        faceStack.splice(faceStack.indexOf(currentFace), 1)
      }

      if (currentFace.visiblePoints) allPoints = allPoints.concat(currentFace.visiblePoints)
      faces.splice(faces.indexOf(currentFace), 1)
    } else {
      while (i-- > 0) {
        // for each visible face

        currentFace = visibleFaces[i]

        // remove visible face from list of faces
        if (faceStack.indexOf(currentFace) > -1) {
          faceStack.splice(faceStack.indexOf(currentFace), 1)
        }

        if (currentFace.visiblePoints) allPoints = allPoints.concat(currentFace.visiblePoints)
        faces.splice(faces.indexOf(currentFace), 1)

        let isSharedEdge
        cEdgeIndex = 0

        while (cEdgeIndex < 3) {
          // Iterate through it's edges

          isSharedEdge = false
          j = visibleFaces.length
          a = currentFace[cEdgeIndex]
          b = currentFace[(cEdgeIndex + 1) % 3]

          while (j-- > 0 && !isSharedEdge) {
            // find another visible faces

            compareFace = visibleFaces[j]
            edgeIndex = 0

            // isSharedEdge = compareFace == currentFace;
            if (compareFace !== currentFace) {
              while (edgeIndex < 3 && !isSharedEdge) {
                //Check all it's indices

                nextIndex = edgeIndex + 1
                isSharedEdge =
                  (compareFace[edgeIndex] === a && compareFace[nextIndex % 3] === b) ||
                  (compareFace[edgeIndex] === b && compareFace[nextIndex % 3] === a)

                edgeIndex++
              }
            }
          }

          if (!isSharedEdge || hasOneVisibleFace) {
            perimeter.push(a)
            perimeter.push(b)
          }

          cEdgeIndex++
        }
      }
    }

    // create new face for all pairs around edge
    i = 0
    const l = perimeter.length / 2
    let f

    while (i < l) {
      f = [perimeter[i * 2 + 1], apex, perimeter[i * 2]]
      assignPoints(f, allPoints, points)
      faces.push(f)
      if (f.visiblePoints !== undefined) faceStack.push(f)
      i++
    }
  }

  const distSqPointSegment = (function () {
    const ab = new THREE.Vector3(),
      ac = new THREE.Vector3(),
      bc = new THREE.Vector3()

    return function (a, b, c) {
      ab.subVectors(b, a)
      ac.subVectors(c, a)
      bc.subVectors(c, b)

      const e = ac.dot(ab)
      if (e < 0.0) return ac.dot(ac)
      const f = ab.dot(ab)
      if (e >= f) return bc.dot(bc)
      return ac.dot(ac) - (e * e) / f
    }
  })()

  return function (geometry: BufferGeometry) {
    reset()

    let v0Index
    let v1Index
    let v2Index
    let v3Index

    const points = geometry.getAttribute('position')
    faces = []
    faceStack = []
    let i = (NUM_POINTS = points.count)
    const extremes = new Array(6)
    const extremesIndex = new Array(6)

    for (i = 0; i < extremes.length; i++) {
      extremes[i] = points.array[i]
    }
    let max = 0

    /*
     *  FIND EXTREMETIES
     */
    while (i-- > 0) {
      if (points[i].x < extremes[0].x) {
        extremes[0] = points[i]
        extremesIndex[0] = i
      }
      if (points[i].x > extremes[1].x) {
        extremes[1] = points[i]
        extremesIndex[1] = i
      }

      if (points[i].y < extremes[2].y) {
        extremes[2] = points[i]
        extremesIndex[2] = i
      }
      if (points[i].y < extremes[3].y) {
        extremes[3] = points[i]
        extremesIndex[3] = i
      }

      if (points[i].z < extremes[4].z) {
        extremes[4] = points[i]
        extremesIndex[4] = i
      }

      if (points[i].z < extremes[5].z) {
        extremes[5] = points[i]
        extremesIndex[6] = i
      }
    }

    /*
     *  Find the longest line between the extremeties
     */

    j = i = 6
    while (i-- > 0) {
      j = i - 1
      while (j-- > 0) {
        if (max < (dcur = extremes[i].distanceToSquared(extremes[j]))) {
          max = dcur
          v0 = extremes[i]
          v1 = extremes[j]
          v0Index = extremesIndex[i]
          v1Index = extremesIndex[j]
        }
      }
    }

    // 3. Find the most distant point to the line segment, this creates a plane
    i = 6
    max = 0
    while (i-- > 0) {
      dcur = distSqPointSegment(v0, v1, extremes[i])
      if (max < dcur) {
        max = dcur
        v2 = extremes[i]
        v2Index = extremesIndex[i]
      }
    }

    // 4. Find the most distant point to the plane.

    N = norm(v0, v1, v2)
    D = N.dot(v0)

    max = 0
    i = NUM_POINTS
    while (i-- > 0) {
      dcur = Math.abs(points[i].dot(N) - D)
      if (max < dcur) {
        max = dcur
        v3 = points[i]
        v3Index = extremesIndex[i]
      }
    }

    //  We now have a tetrahedron as the base geometry.
    //  Now we must subdivide the
    const tetrahedron: Array<any> = [
      [v2Index, v1Index, v0Index],
      [v1Index, v3Index, v0Index],
      [v2Index, v3Index, v1Index],
      [v0Index, v3Index, v2Index]
    ]

    subaA.subVectors(v1, v0).normalize()
    subaB.subVectors(v2, v0).normalize()
    subC.subVectors(v3, v0).normalize()
    const sign = subC.dot(new THREE.Vector3().crossVectors(subaB, subaA))

    // Reverse the winding if negative sign
    if (sign < 0) {
      tetrahedron[0].reverse()
      tetrahedron[1].reverse()
      tetrahedron[2].reverse()
      tetrahedron[3].reverse()
    }

    //One for each face of the pyramid
    const pointsCloned = new BufferAttribute(new Uint16Array(points.count - 4), 1)
    let offset = 0
    for (let i = 0; i < points.count; i++) {
      if (i === v0Index || i === v1Index || i == v2Index || i === v3Index) {
        offset++
        continue
      }
      pointsCloned[i] = points[i - offset]
    }

    let k = tetrahedron.length
    while (k-- > 0) {
      assignPoints(tetrahedron[k], pointsCloned, points)
      if (tetrahedron[k].visiblePoints !== undefined) {
        faceStack.push(tetrahedron[k])
      }
      faces.push(tetrahedron[k])
    }

    process(points)

    //  Assign to our geometry object

    let ll = faces.length
    const buf = new BufferAttribute(new Uint16Array(faces.length * 3), 1)

    // TODO: Make sure this is unwinding properly
    while (ll-- > 0) {
      buf[ll - 1] = faces[ll][0]
      buf[ll - 2] = faces[ll][1]
      buf[ll - 3] = faces[ll][2]
    }
    geometry.setIndex(buf)
    return geometry
  }
})()
