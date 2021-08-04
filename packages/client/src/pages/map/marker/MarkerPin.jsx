import React from 'react'
// import styles from './MarkerPin.scss';
import "./MarkerPin.scss";
import { ReactComponent as Close } from './close.svg';

export default function MarkerPin() {
    return (
        <div>
            <span className="text">Finding your location...</span>
            <div className='wrap'>
                <div className="pulsure">
                    <div className="green-pin">
                    </div>
                </div>
                <section id="location">
                    <div className="container">
                        <div className="row">
                            <div className="location-item">
                                <span className="location-pointer"></span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Close className="close" />
        </div>
    )
}
