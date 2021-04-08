
import React from "react";
import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";
import FeedMenu from "@xr3ngine/client-core/src/socialmedia/components/FeedMenu";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";

import { selectCreatorsState } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/selector";
import FlatSignIn from '@xr3ngine/client-core/src/socialmedia/components/Login';
import {Stories} from '@xr3ngine/client-core/src/socialmedia/components/Stories';

// import { Plugins } from '@capacitor/core';

import styles from './index.module.scss';
import { selectAuthState } from "@xr3ngine/client-core/src/user/reducers/auth/selector";
import { connect } from "react-redux";
import { User } from "@xr3ngine/common/interfaces/User";
import { bindActionCreators, Dispatch } from "redux";
import { doLoginAuto } from "@xr3ngine/client-core/src/user/reducers/auth/service";
import { createCreator } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/service";

const { Example } = Plugins;
        
const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    auth: selectAuthState(state),
    creatorsState: selectCreatorsState(state),
   
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  // loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch)
});



const  Home = ({ authState, creatorsState, createCreator,  doLoginAuto, auth}) => {
  
 
 
  const { data, setLoginUser } = LoginUserHook();
  const [loginData, setLoginData] = useState(null);
  const [stories, setStories] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [feed, setFeed] = useState(null);

    

  const updateLoginUser = (data: any) => {
    setLoginUser(data);
    setLoginData(data);
  };

  const status = authState.get('authUser')?.identityProvider.type;
  


  useEffect(()=>{
    if (status === 'guest') {
    if(auth){
      // const user = auth.get('authUser').identityProvider as User;
      const user = auth.get('user') as User;
      console.log(user);
      const userId = user ? user.id : null;
      if(userId){
        createCreator();
      }
    }
  }else{
    if(auth){
       const user = auth.get('authUser').identityProvider as User;
      console.log(user);
      const userId = user ? user.id : null;
      if(userId){
        createCreator();
      }
    }
  }}
  ,[auth]);


 
 

  useEffect(() => {
    if (Example) {
      Example.echo({ value: 'Example plugin detected' }).then(data => {
        console.log(data);
      });
    }
  
  setLoginData({username:'username'});
  doLoginAuto(true);
  }, []);

 

  useEffect(() => {
   
    fetch("/api/loginUser")
      .then((response) => response.json())
      .then((data) => updateLoginUser(data));

  return (<>
    <div className={styles.viewport}>
     {authState.get('user')?.id && creatorsState?.get('currentCreator') ? 
      <>
        <AppHeader logo="/assets/logoBlack.png" />
        <Stories stories={stories} />
        <FeedMenu />
        {/* <MoreModalItems /> */}
        {/* <div className="homepage-feed lg:mr-8 flex flex-col ">
            {feed &&
              feed.map((item: any) => {
                return <FeedItem data={item} key={item.pid} />;
              })}
          </div> */}
        {/* <HomeRightBar data={suggestions} /> */}
        <AppFooter /></> : 
        <FlatSignIn logo="/assets/LogoColored.png" />}
    </div>
  </>
  );
};

  export default connect(mapStateToProps,mapDispatchToProps)(Home);