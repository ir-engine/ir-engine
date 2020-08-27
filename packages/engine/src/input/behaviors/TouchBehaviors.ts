import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { Binary } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';

/**
 * Handle Touch
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouch: Behavior = (entity: Entity, args: { event: TouchEvent, value: Binary }): void => {
  // If the touch is ON
  if (args.value === BinaryValue.ON) {
    let s = 'Touch start.';
    // A list of contact points on a touch surface.
    if (args.event.targetTouches.length) {
      s +=
        ' x: ' +
        Math.trunc(args.event.targetTouches[0].clientX) +
        ', y: ' +
        Math.trunc(args.event.targetTouches[0].clientY);
    }
    console.log(s);
  } else {
    console.log('Touch end.');
  }
};

/**
 * Touch move
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  let s = 'Touch move.';
  // A list of contact points on a touch surface.
  if (args.event.targetTouches.length) {
    s +=
      ' x: ' +
      Math.trunc(args.event.targetTouches[0].clientX) +
      ', y: ' +
      Math.trunc(args.event.targetTouches[0].clientY);
  }
  console.log(s);
};
