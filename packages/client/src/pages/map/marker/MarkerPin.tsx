import React from 'react'
import styles from './MarkerPin.module.scss'
import PinSvg from './pin.svg'
import CloseSvg from './close.svg'

const MarkerPin = () => {
  return (
    <div className={styles.bcg}>
      <span className={styles.text}>Finding your location...</span>
      <div className={styles.wrap}>
        {/* <div className={styles.pulsure}> */}
        {/* <div className={styles.green}> */}

        <img className={styles.pinsvg} src={PinSvg} alt="PinSvg"></img>

        <img className={styles.map} src={CloseSvg} alt="CloseSvg"></img>

        {/* <div className={styles.container}>
                        <div className={styles.row}>
                            <div className={styles.locationItem}>
                                <span className={styles.locationPointer}></span>
                            </div>
                        </div>
                    </div> */}

        {/* </div> */}

        {/* </div> */}
        {/* <section className={styles.location}> */}

        {/* </section> */}
      </div>
    </div>
  )
}

export default MarkerPin
