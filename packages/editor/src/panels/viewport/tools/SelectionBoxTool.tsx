import { defineState, getMutableState } from '@ir-engine/hyperflux'
import React, { useEffect, useState } from 'react'
export const selectionBox = defineState({
  name: 'selection Box',
  initial: () => ({
    selectionBoxEnabled: false
  })
})

export default function SelectionBox({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [isSelecting, setIsSelecting] = useState(false)
  const [mouseOffsetX, setMouseOffsetX] = useState(0)
  const [mouseOffsetY, setMouseOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const handleMouseDown = (e: React.MouseEvent) => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const toolbarRect = toolbarRef.current!.getBoundingClientRect()
    setStartX(e.clientX)
    setStartY(e.clientY)
    setIsDragging(true)
    setLeft(e.clientX - viewportRect.left)
    setTop(e.clientY - viewportRect.top - toolbarRect.height)
    setWidth(0)
    setHeight(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setWidth(e.clientX - startX)
    setHeight(e.clientY - startY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    //updateSelectionEntity()
  }
  // const updateSelectionEntity = () => {
  //   //get screen space bounding box

  // }
  // function convertScreenToNDC(x, y, width, height) {
  //   const ndcX = (x / window.innerWidth) * 2 - 1;
  //   const ndcY = -(y / window.innerHeight) * 2 + 1;

  //   const ndcX2 = ((x + width) / window.innerWidth) * 2 - 1;
  //   const ndcY2 = -((y + height) / window.innerHeight) * 2 + 1;

  //   return {
  //     left: Math.min(ndcX, ndcX2),
  //     right: Math.max(ndcX, ndcX2),
  //     top: Math.max(ndcY, ndcY2),
  //     bottom: Math.min(ndcY, ndcY2),
  //   };
  // }
  // function projectBoundingBoxToScreen(camera, object){
  //   const box = new THREE.Box3().setFromObject(object); // Get bounding box for object
  //   const points = [
  //     new THREE.Vector3(box.min.x, box.min.y, box.min.z),
  //     new THREE.Vector3(box.min.x, box.min.y, box.max.z),
  //     new THREE.Vector3(box.min.x, box.max.y, box.min.z),
  //     new THREE.Vector3(box.min.x, box.max.y, box.max.z),
  //     new THREE.Vector3(box.max.x, box.min.y, box.min.z),
  //     new THREE.Vector3(box.max.x, box.min.y, box.max.z),
  //     new THREE.Vector3(box.max.x, box.max.y, box.min.z),
  //     new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  //   ];

  //   // Project each corner of the 3D bounding box to 2D screen space
  //   const projectedPoints = points.map((point) => {
  //     const projected = point.clone().project(camera);
  //     return {
  //       x: (projected.x + 1) / 2 * window.innerWidth,
  //       y: -(projected.y - 1) / 2 * window.innerHeight,
  //     };
  //   });

  //   return projectedPoints;
  // }
  // function isBoundingBoxInSelection(selectionBox, projectedPoints) {
  //   const { left, right, top, bottom } = selectionBox;

  //   // Check if any of the points of the bounding box are inside the selection box
  //   for (let point of projectedPoints) {
  //     if (point.x >= left && point.x <= right && point.y <= top && point.y >= bottom) {
  //       return true; // One of the points is inside the selection box
  //     }
  //   }

  //   return false; // No points intersect the selection box
  // }
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown as any)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown as any)
    }
  }, [isDragging])
  return (
    <div className="relative h-full w-full">
      {getMutableState(selectionBox).selectionBoxEnabled.value && isDragging && (
        <div
          className="absolute z-[5] flex flex-col items-center border-2 border-dashed border-white bg-transparent"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`
          }}
        />
      )}
      {/* )} */}
    </div>
  )
}
