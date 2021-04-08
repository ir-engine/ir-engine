import React from "react";
import Router from "next/router";

import AddCircleIcon from '@material-ui/icons/AddCircle';
import HomeIcon from '@material-ui/icons/Home';
import WhatshotIcon from '@material-ui/icons/Whatshot';

import * as styles from './Footer.module.scss';
import Avatar from "@material-ui/core/Avatar";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { useEffect } from "react";
import { selectCreatorsState } from "../../reducers/creator/selector";
import { getLoggedCreator } from "../../reducers/creator/service";

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLoggedCreator: bindActionCreators(getLoggedCreator, dispatch),
});

const AppFooter = ({creatorState, getLoggedCreator}: any) => {
  useEffect(()=>getLoggedCreator(),[]);  
  const creator = creatorState && creatorState.get('fetching') === false && creatorState.get('currentCreator');
  return (
    <nav className={styles.footerContainer}>
        <HomeIcon onClick={()=>Router.push('/')} fontSize="large" className={styles.footerItem}/>
        <AddCircleIcon onClick={()=>Router.push('/newfeed')} style={{fontSize: '5em'}} className={styles.footerItem}/>
        {creator && <WhatshotIcon htmlColor="#FF6201" onClick={()=>Router.push({ pathname: '/notifications'})} /> }
        {creator && (
          <Avatar onClick={()=>Router.push({ pathname: '/creator', query:{ creatorId: creator.id}})} 
          alt={creator.username} src={creator.avatar} />
        )}
    </nav>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AppFooter);

