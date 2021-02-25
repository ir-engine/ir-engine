import React, { useState } from 'react';

const Draggable = (props) => {
    const MARGIN = 20;
    const ref = React.createRef<HTMLDivElement>();
    const [dragStarted, setDragStarted] = useState(false);
    const [prev, setPrev] = useState({ x: 0, y: 0 });

    const clamp = (low, value, high) => {
        if (value < low) return low;
        if (value > high) return high;
        return value;
    }
    const handleMouseDown = (e) => {
        if (e.button !== 0 && e.type !== 'touchstart') return;

        const point = getCoordinates(e);
        setDragStarted(true);
        setPrev(point);
        ref.current.style.transition = '';
    }

    const handleMouseMove = (e) => {
        if (!dragStarted) return;

        const point = getCoordinates(e);
        const container = ref.current;

        const boundingRect = ref.current.getBoundingClientRect();
        container.style.left = clamp(MARGIN, (boundingRect.left + point.x  - prev.x), window.innerWidth - boundingRect.width - MARGIN) + 'px';
        container.style.top = clamp(MARGIN, (boundingRect.top + point.y - prev.y), window.innerHeight - boundingRect.height - MARGIN) + 'px';
        setPrev(point);
    }

    const handleMouseUp = () => {
        setDragStarted(false);
        setPrev({ x: 0, y: 0 });
        const container = ref.current;
        const boundingRect = container.getBoundingClientRect();
        const margin = {
            left: boundingRect.left - MARGIN,
            right: window.innerWidth - boundingRect.left - boundingRect.width - MARGIN,
        }

        let p = margin.left <= margin.right
            ? { x: MARGIN, y: boundingRect.top }
            : { x: window.innerWidth - boundingRect.width - MARGIN, y: boundingRect.top }

        container.style.left = p.x + 'px';
        container.style.top = p.y + 'px';
        container.style.transition = 'all 0.1s linear';
    }

    const getCoordinates = (e) => {
        if (e.touches) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        } else {
            return {
                x: e.clientX,
                y: e.clientY,
            };
        }
    }

    return (
        <div
            ref={ref}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{touchAction: 'none', top: 0, left: 0, position: props.isPiP ? 'fixed' : 'initial' }}
        >
            {props.children}
        </div>
    )
};

export default Draggable;