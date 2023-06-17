/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect, useState } from 'react'

import CardMedia from '@etherealengine/ui/src/primitives/mui/CardMedia'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import styles from './index.module.scss'

const placeHolder =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='

export const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(placeHolder)
  const [imageRef, setImageRef] = useState<HTMLImageElement>(null!)
  const [isLoadedImage, setIsLoadedImage] = useState(true)

  const onLoad = (event) => {
    event.target.classList.add(styles.loaded)
    setIsLoadedImage(true)
  }

  const onError = () => setIsLoadedImage(false)

  useEffect(() => {
    let observer
    let didCancel = false

    if (imageRef && imageSrc !== src) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!didCancel && (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                setImageSrc(src)
                observer.unobserve(imageRef)
              }
            })
          },
          {
            threshold: 0.01,
            rootMargin: '75%'
          }
        )
        observer.observe(imageRef)
      } else {
        // Old browsers fallback
        setImageSrc(src)
      }
    }
    return () => {
      didCancel = true
      // on component cleanup, we remove the listner
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef)
      }
    }
  }, [src, imageSrc, imageRef])

  return isLoadedImage == true ? (
    <CardMedia
      component="img"
      alt={alt}
      //@ts-ignore
      ref={setImageRef}
      height="145"
      onLoad={onLoad}
      onError={onError}
      src={imageSrc}
      title={alt}
      className={styles.lazyImage}
    />
  ) : (
    <Icon type="PermIdentity" color="primary" className={styles.lazyImage} />
  )
}
