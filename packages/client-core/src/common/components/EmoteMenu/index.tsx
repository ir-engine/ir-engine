import React, { MouseEventHandler } from 'react';
import Button from '@material-ui/core/Button';
import ScrollableElement from '../ScrollableElement';
// @ts-ignore
import styles from './EmoteMenu.module.scss';
import { ClientInputSchema } from '@xrengine/engine/src/input/schema/ClientInputSchema';
import { AnimationManager } from '@xrengine/engine/src/character/AnimationManager';
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine';
import { getMutableComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '@xrengine/engine/src/input/components/LocalInputReceiver';
import { AnimationComponent } from '@xrengine/engine/src/character/components/AnimationComponent';
import { defaultAvatarAnimations } from '@xrengine/engine/src/character/CharacterAvatars';
import { CharacterAnimations } from '@xrengine/engine/src/character/CharacterAnimations';
import { CharacterComponent } from '@xrengine/engine/src/character/components/CharacterComponent';
import { AnimationStateGraph, CharacterStates } from '@xrengine/engine/src/character/animations/AnimationState';

type MenuItemType = {
    body: any;
    containerProps: {
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

type EmoteMenuPropsType = {
    // items: MenuItemType[];
}


const EmoteMenuCore = (props: EmoteMenuPropsType) => {
    const items: MenuItemType[] = [
        {
            body: 1,
            containerProps: {
                onClick: () => runAnimation(defaultAvatarAnimations[CharacterAnimations.ENTERING_VEHICLE_DRIVER].name)
            },
        },
        {
            body: 2,
            containerProps: {
                onClick: () => runAnimation(defaultAvatarAnimations[CharacterAnimations.ENTERING_VEHICLE_PASSENGER].name)
            },
        },
        {
            body: 3,
            containerProps: {
                onClick: () => runAnimation(defaultAvatarAnimations[CharacterAnimations.EXITING_VEHICLE_DRIVER].name)
            },
        },
        {
            body: 4,
            containerProps: {
                onClick: () => runAnimation(defaultAvatarAnimations[CharacterAnimations.EXITING_VEHICLE_PASSENGER].name)
            },
        },
    ];

    const runAnimation = (animationName: string) => {
        const entity = Engine.entities.find(e => e.name === 'Player' && hasComponent(e, LocalInputReceiver));
        const actor = getMutableComponent(entity, CharacterComponent);
        const animationComponent = getMutableComponent(entity, AnimationComponent);

        AnimationStateGraph[CharacterStates.ENTERING_VEHICLE].animations[0].weight = 1;
        AnimationStateGraph[CharacterStates.ENTERING_VEHICLE].animations[1].weight = 0;


        animationComponent.pauseOtherAnimations(AnimationManager.instance.getAnimationDuration(AnimationStateGraph[CharacterStates.ENTERING_VEHICLE].animations[0].name) * 1000)

        AnimationManager.instance.transitionState(actor, animationComponent, CharacterStates.ENTERING_VEHICLE);
    }

    const jumpStart = () => {
        const keydownEvent = ClientInputSchema.eventBindings.keydown[0];

        keydownEvent.behavior({
            value: keydownEvent.args.value,
            event: {
                key: ' ',
            } as KeyboardEvent,
        });
    };

    const jumpStop = () => {
        const keyUpEvent = ClientInputSchema.eventBindings.keyup[0];

        keyUpEvent.behavior({
            value: keyUpEvent.args.value,
            event: {
                key: ' ',
            } as KeyboardEvent,
        });
    };

    return (
        <section className={styles.emoteMenu}>
            <ScrollableElement height={250}>
                {items.map((item, index) => {
                    return (
                        <Button
                            className={styles.menuItem}
                            key={index}
                            {...item.containerProps}
                        >
                            {item.body}
                        </Button>
                    );
                })}
            </ScrollableElement>
            <div className={styles.jumpContainer}>
                <Button
                    className={styles.menuItem}
                    onMouseDown={jumpStart}
                    onMouseUp={jumpStop}
                >
                    J
                </Button>
            </div>
        </section>
    );
};

export default EmoteMenuCore;
