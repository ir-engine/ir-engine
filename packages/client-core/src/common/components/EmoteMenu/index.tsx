import React, { MouseEventHandler } from 'react';
import Button from '@material-ui/core/Button';
import ScrollableElement from '../ScrollableElement';
// @ts-ignore
import styles from './EmoteMenu.module.scss';
import { ClientInputSchema } from '@xrengine/engine/src/input/schema/ClientInputSchema';
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine';
import { getMutableComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '@xrengine/engine/src/input/components/LocalInputReceiver';
import { AnimationComponent } from '@xrengine/engine/src/character/components/AnimationComponent';
import { CharacterComponent } from '@xrengine/engine/src/character/components/CharacterComponent';
import { CalculateWeightsParams, CharacterAnimations, CharacterStates } from '@xrengine/engine/src/character/animations/Util';

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
            body: 'Dance 1',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.DANCING_1  })
            },
        },
        {
            body: 'Dance 2',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.DANCING_2 })
            },
        },
        {
            body: 'Cheering 1',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.CHEERING_1 })
            },
        },
        {
            body: 'Cheering 2',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.CHEERING_2 })
            },
        },
        {
            body: 'Clapping',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.EMOTE, { animationName: CharacterAnimations.CLAPPING })
            },
        },
        {
            body: 'Laughing',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.EMOTE, { animationName: CharacterAnimations.LAUGHING })
            },
        },
        {
            body: 'Wave Left',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.EMOTE, { animationName: CharacterAnimations.WAVE_LEFT })
            },
        },
        {
            body: 'Wave Right',
            containerProps: {
                onClick: () => runAnimation(CharacterStates.EMOTE, { animationName: CharacterAnimations.WAVE_RIGHT })
            },
        },
    ];

    const runAnimation = (animationName: string, params: CalculateWeightsParams) => {
        const entity = Engine.entities.find(e => e.name === 'Player' && hasComponent(e, LocalInputReceiver));
        const actor = getMutableComponent(entity, CharacterComponent);
        const animationComponent = getMutableComponent(entity, AnimationComponent);

        const animationState = animationComponent.animationGraph.states[animationName];

        if (animationComponent.currentState.name === animationState.name) {
            params.resetAnimation = true;
            animationComponent.currentState.update(params);
        } else {
            animationComponent.animationGraph.transitionState(actor, animationComponent, animationState.name, params);
        }
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
                    Jump
                </Button>
            </div>
        </section>
    );
};

export default EmoteMenuCore;
