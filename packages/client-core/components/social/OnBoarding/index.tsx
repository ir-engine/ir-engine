import React, { useState } from 'react';

import CardMedia from '@material-ui/core/CardMedia';
import styles from './OnBoarding.module.scss';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Router from "next/router";

interface MediaRecord{
    screenBg: string;
    images: string[];
}
interface Props {
    media: MediaRecord[];    
}

const OnBoardingComponent = ({media}: Props) => { 
    const [step, setStep] = useState(0);
    let content = null;
    console.log('media[step].screenBg',media[step].screenBg)
    switch (step) {
        case 0:
            content = <section className={styles.step_0}>
                        <Typography color="secondary" variant="h1" align="center">Welcome to ARC!</Typography>
                        <Typography color="secondary" variant="h2">Biggest collection of 370+ layouts for iOS prototyping.</Typography>
                        <Button variant="contained" color="primary" fullWidth onClick={()=>setStep(step+1)}>Next</Button>
                    </section>; 
                    break;   
        case 1:
            content = <section className={styles.step_1}>
                        <span className={styles.placeholder} />
                        <CardMedia   
                            className={styles.image}                  
                                image={media[step].images[0]}
                                title="Discover articles, news & posts"
                            />
                        <Typography variant="h1" align="center">Discover articles,<br /> news & posts</Typography>
                        <Typography variant="h2" align="center">It is those feelings that drive our love of astronomy and our desire.</Typography>
                        <span className={styles.placeholder} />
                        <Button variant="contained" color="primary" onClick={()=>setStep(step+1)}>Get Started</Button>
                    </section>; 
                    break;    
        default:
            content = <section className={styles.step_2}>   
                        <Button variant="contained" color="primary" onClick={()=>Router.push("/login")}>Next</Button>
                        <span className={styles.placeholder} />
                        <Typography variant="h1" align="center">Meet up with <br /> friends.</Typography>
                        <Typography variant="h2" align="center">It is those feelings that drive our love of astronomy and our desire.</Typography>
                        <span className={styles.placeholder} />
                        <CardMedia   
                            className={styles.image}                  
                                image={media[step].images[0]}
                                title="Meet up with friends"
                            />
                    </section>; ;
    }

    return <section className={styles.fullPage} style={{backgroundImage: `url(${media[step].screenBg})`}}><section className={styles.subWrapper}>{content}</section></section>
};

export default OnBoardingComponent;