import React, { MouseEventHandler } from 'react';
import Button from '@material-ui/core/Button';
import ScrollableElement from '../ScrollableElement';
// @ts-ignore
import styles from './EmoteMenu.module.scss';
import { ClientInputSchema } from '@xrengine/engine/src/input/schema/ClientInputSchema';

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
                onClick: () => { console.debug('Make pose 1');}
            },
        },
        {
            body: 2,
            containerProps: {
                onClick: () => { console.debug('Make pose 2');}
            },
        },
        {
            body: 3,
            containerProps: {
                onClick: () => { console.debug('Make pose 3');}
            },
        },
        {
            body: 4,
            containerProps: {
                onClick: () => { console.debug('Make pose 4');}
            },
        },
    ];

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
