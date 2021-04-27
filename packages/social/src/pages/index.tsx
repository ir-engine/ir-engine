
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";
import FeedMenu from "@xr3ngine/client-core/src/socialmedia/components/FeedMenu";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import { selectCreatorsState } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/selector";
import {Stories} from '@xr3ngine/client-core/src/socialmedia/components/Stories';
import { selectAuthState } from "@xr3ngine/client-core/src/user/reducers/auth/selector";
import { User } from "@xr3ngine/common/src/interfaces/User";
import { doLoginAuto } from "@xr3ngine/client-core/src/user/reducers/auth/service";
import { createCreator } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/service";

// @ts-ignore
import styles from './index.module.scss';
import { selectPopupsState } from "@xr3ngine/client-core/src/socialmedia/reducers/popupsState/selector";
import { updateCreatorPageState } from "@xr3ngine/client-core/src/socialmedia/reducers/popupsState/service";
import SharedModal from "@xr3ngine/client-core/src/socialmedia/components/SharedModal";
import Creator from "@xr3ngine/client-core/src/socialmedia/components/Creator";
        
const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state),
    creatorsState: selectCreatorsState(state),   
    popupsState: selectPopupsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
});

const  Home = ({ createCreator,  doLoginAuto, auth, popupsState, updateCreatorPageState }) => {
  /*hided for now*/
  useEffect(()=>{
    if(auth){
      // const user = auth.get('authUser')?.identityProvider.type === 'guest' ? auth.get('user') as User : auth.get('authUser')?.identityProvider as User;
      //   const userId = user ? user.id : null;
      //   if(userId){}
          createCreator();
             
    }
  },[auth]);

  useEffect(() => doLoginAuto(true), []); 
        
  const stories = [] as any [];
      for(let i=0;i<20;i++){
      stories.push({
          image:null
      });
  }

   //common for creator page
   const handleClose = () => {
    updateCreatorPageState(false);
  };
const renderModal = () => 
    (popupsState?.get('creatorPage') === true && popupsState?.get('creatorId')) ?  
        (<SharedModal 
            open={popupsState?.get('creatorPage')}
            onClose={handleClose} 
            className={styles.creatorPopup}
        >
        <Creator creatorId={popupsState?.get('creatorId')} />
        </SharedModal>) 
        : 
        <></>;
  useEffect(()=> {renderModal();}, [popupsState.get('creatorPage'), popupsState.get('creatorId')]);

  return (<>
    <div className={styles.viewport}>
        <AppHeader logo="/assets/logoBlack.png" />
        <Stories stories={stories} />
        <FeedMenu />
        <AppFooter onGoHome={handleClose}/>
        {renderModal()}
    </div>
  </>
  );
};

export default connect(mapStateToProps,mapDispatchToProps)(Home);
