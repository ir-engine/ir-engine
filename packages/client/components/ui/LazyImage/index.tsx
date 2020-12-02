import CardMedia from "@material-ui/core/CardMedia";
import React, { useState, useEffect } from "react";
import styles from './LazyImage.module.scss';

const placeHolder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=";

export const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(placeHolder);
  const [imageRef, setImageRef] = useState();

  const onLoad = event => {
    event.target.classList.add(styles.loaded);
    event.target.classList.remove(styles.hasError);
  };

  const onError = event => {
    event.target.classList.add(styles.hasError);
  };

  useEffect(
    () => {
      let observer;
      let didCancel = false;

      if (imageRef && imageSrc !== src) {
        if (IntersectionObserver) {
          observer = new IntersectionObserver(
            entries => {
              entries.forEach(entry => {
                if (
                  !didCancel &&
                  (entry.intersectionRatio > 0 || entry.isIntersecting)
                ) {
                  setImageSrc(src);
                  observer.unobserve(imageRef);
                }
              });
            },
            {
              threshold: 0.01,
              rootMargin: "75%"
            }
          );
          observer.observe(imageRef);
        } else {
          // Old browsers fallback
          setImageSrc(src);
        }
      }
      return () => {
        didCancel = true;
        // on component cleanup, we remove the listner
        if (observer && observer.unobserve) {
          observer.unobserve(imageRef);
        }
      };
    },
    [src, imageSrc, imageRef]
  );

  return (
    <CardMedia
      component="img"
      alt={alt}
      ref={setImageRef}
      height="145"
      onLoad={onLoad}
      onError={onError}
      src={imageSrc}
      title={alt}
      className={styles.lazyImage}
    />
    
  );
};
