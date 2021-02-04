import React, { useState, useRef, useEffect } from "react";
import StoryItem from "./story-item";
import Box from "./box";
import ArrowButton from "./arrow_button";

export default function Stories({ stories }) {
  const [x, setX] = useState(0);
  const [maxItems, setMaxItems] = useState(7);
  const [min_X, setMinX] = useState(0);

  const windowRef = useRef(null);

  useEffect(() => {
    if (windowRef.current.clientWidth > 0) {
      ((windowRef.current.clientWidth / 80) | 0) !== maxItems &&
        ((windowRef.current.clientWidth / 80) | 0) <= 7 &&
        setMaxItems((windowRef.current.clientWidth / 80) | 0);

      setMinX(-((stories?.length - maxItems) * 80 + (5 - maxItems) * 15));
    }
  });

  const calculateTransform = (newX) => {
    if (newX < min_X) setX(min_X);
    else if (newX > 0) setX(0);
    else setX(newX);
  };

  return (
    <Box className="stories-container sm:full-width" border>
      <div
        className="stories-feed overflow-y-hidden py-4 px-2 flex relative items-center"
        ref={windowRef}
      >
        {x !== 0 && (
          <ArrowButton
            place="left"
            text="<"
            onClick={() => calculateTransform(x + 320)}
          />
        )}
        <div
          className="stories-feed-floating flex relative transition ease-linear duration-300"
          style={{ transform: `translate(${x}px, 0px)` }}
        >
          {stories &&
            stories.map((item) => {
              return <StoryItem data={item} key={item.username} />;
            })}
        </div>
        {x !== min_X && stories?.length > maxItems && (
          <ArrowButton
            place="right"
            text=">"
            onClick={() => calculateTransform(x - 320)}
          />
        )}
      </div>
    </Box>
  );
}
