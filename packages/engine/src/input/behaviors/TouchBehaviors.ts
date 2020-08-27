import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';

export const handleTouch: Behavior = (entity: Entity, args: { event: TouchEvent, value: BinaryType }): void => {
  if (args.value === BinaryValue.ON) {
    let s = 'Touch start.';
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

export const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  let s = 'Touch move.';
  if (args.event.targetTouches.length) {
    s +=
      ' x: ' +
      Math.trunc(args.event.targetTouches[0].clientX) +
      ', y: ' +
      Math.trunc(args.event.targetTouches[0].clientY);
  }
  console.log(s);
};
