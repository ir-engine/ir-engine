import Button from "@material-ui/core/Button";
// import { useRouter } from "next/router";
import React, { useState } from "react";
import Creators from "../Creators";
import Featured from "../Featured";
import TheFeed from "../TheFeed";
import TipsAndTricks from "../TipsAndTricks";

import styles from './FeedMenu.module.scss';

export function FeedMenu() {
  const [view, setView] = useState('featured');
  const [left, setLeft] = useState(0);

  const handleMenuClick = (view) =>{
    setView(view);
    switch (view) {
      case 'creators':setLeft(-50);break;
      case 'thefeed': setLeft(-100);break;
      case 'tipsandtricks': setLeft(-150);break;
      default:setLeft(0);break;
    }
  }
  let content = null;
  switch (view) {
    case 'creators': content=<Creators />;break;
    case 'thefeed': content=<TheFeed />;break;
    case 'tipsandtricks': content=<TipsAndTricks />;break;
    default:content=<Featured />;break;
  }
  const classes = {
    featured: [styles.featuredButton, view === 'featured' && styles.active],
    creators: [styles.creatorsButton, view === 'creators' && styles.active],
    thefeed: [styles.thefeedButton, view === 'thefeed' && styles.active],
    tipsandtricks: [styles.tipsandtricksButton, view === 'tipsandtricks' && styles.active],
  }
  return (
    <><nav className={styles.feedMenuContainer}>  
      <section className={styles.feedMenu} style={{left:left+'px'}}>
        <Button variant="contained" className={classes['featured'].join(' ')} onClick={()=>handleMenuClick('featured')}>Featured</Button>        
        <Button variant="contained" className={classes['creators'].join(' ')} onClick={()=>handleMenuClick('creators')}>Creators</Button>
        <Button variant="contained" className={classes['thefeed'].join(' ')} onClick={()=>handleMenuClick('thefeed')}>The Feed</Button>
        <Button variant="contained" className={classes['tipsandtricks'].join(' ')} onClick={()=>handleMenuClick('tipsandtricks')}>Tips & Tricks</Button>
      </section>   
    </nav>
    <section className={styles.content}>{content}</section>
    </>
  );
}
