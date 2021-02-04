import React, { useState, useRef, useEffect } from "react";
import ArrowButton from "./arrow_button";

export default function FeedItemPhotos({ photos }) {
  const photoRef = useRef(0);

  const [photosX, setPhotosX] = useState(0);
  const [refLoaded, setRefLoaded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [min_x, setMinX] = useState(
    -((photoRef.current.width + 2) * (photos.length - 1))
  );

  useEffect(() => {
    if (photoRef) setRefLoaded(true);
  }, [photoRef]);

  useEffect(() => {
    if (photoRef.current.width > 0)
      setMinX(-((photoRef.current.width + 2) * (photos.length - 1)));
    console.log(photoRef.current.width);
  });

  const slideButtonEvent = (x) => {
    if (x < min_x) setPhotosX(min_x);
    else if (x > 0) setPhotosX(0);
    else setPhotosX(x);
  };

  return (
    <div className="feed-photo-container flex relative items-center">
      {photosX !== 0 && (
        <ArrowButton
          place="left"
          text="<"
          onClick={() => {
            slideButtonEvent(photosX + photoRef.current.width + 2);
            setSelectedPhoto(selectedPhoto - 1);
          }}
        />
      )}
      <div
        className="feed-photo-images-container w-full flex relative transition ease-linear duration-200"
        style={{ transform: `translate(${photosX}px, 0px)` }}
      >
        <img
          className="flex-1 object-fill"
          src={photos[0] || "https://picsum.photos/400/400"}
          ref={photoRef}
        />{" "}
        {refLoaded &&
          photos.map((item, index) => {
            return (
              index !== 0 && (
                <img
                  key={index}
                  className="flex-1 object-fill hide-photo absolute overflow-hidden"
                  style={{
                    width: photoRef.current.width,
                    transform: `translate(${
                      (photoRef.current.width + 2) * index
                    }px, 0px)`,
                  }}
                  src={item || "hhttps://picsum.photos/400/400"}
                />
              )
            );
          })}
      </div>
      {photosX !== min_x && photos.length > 1 && (
        <ArrowButton
          place="right"
          text=">"
          onClick={() => {
            slideButtonEvent(photosX - photoRef.current.width - 2);
            setSelectedPhoto(selectedPhoto + 1);
          }}
        />
      )}
      {photos.length > 1 && (
        <div className="slide-dots absolute flex">
          {photos.map((item, index) => {
            return (
              <div
                key={index}
                className="slide-dot flex justify-center"
                style={{
                  backgroundColor: index === selectedPhoto && "#0095F6",
                }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
}
