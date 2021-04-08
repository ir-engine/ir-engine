
import React from "react";
import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";
import FeedMenu from "@xr3ngine/client-core/src/socialmedia/components/FeedMenu";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";

import { selectCreatorsState } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/selector";
import FlatSignIn from '@xr3ngine/client-core/src/socialmedia/components/Login';
import {Stories} from '@xr3ngine/client-core/src/socialmedia/components/Stories';

import styles from './index.module.scss';
import { selectAuthState } from "@xr3ngine/client-core/src/user/reducers/auth/selector";
import { connect } from "react-redux";
import { Dispatch } from "redux";

        
const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    creatorsState: selectCreatorsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});



const  Home = ({ authState, creatorsState}) => {

  const stories = [] as any [];
  for(let i=0;i<20;i++){
    stories.push({image:null});
  }

  return (<>
    <div className={styles.viewport}>
     {authState.get('user')?.id && creatorsState?.get('currentCreator') ? 
      <>
        <AppHeader logo="/assets/logoBlack.png" />
        <Stories stories={stories} />
        <FeedMenu />
        <AppFooter />
      </> : 
        <FlatSignIn logo="/assets/LogoColored.png" />}
    </div>
  </>
  );
};

  export default connect(mapStateToProps,mapDispatchToProps)(Home);