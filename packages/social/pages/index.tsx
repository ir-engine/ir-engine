
import React from "react";
import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";
import FeedMenu from "@xr3ngine/client-core/src/socialmedia/components/FeedMenu";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import FlatSignIn from '@xr3ngine/client-core/src/socialmedia/components/Login';
import {Stories} from '@xr3ngine/client-core/src/socialmedia/components/Stories';

import { selectCreatorsState } from "@xr3ngine/client-core/src/socialmedia/reducers/creator/selector";

// import { Plugins } from '@capacitor/core';

import styles from './index.module.scss';
import { selectAuthState } from "@xr3ngine/client-core/src/user/reducers/auth/selector";
import { connect } from "react-redux";
// const { Example } = Plugins;

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    creatorsState: selectCreatorsState(state),
  };
};

const  Home = ({ authState, creatorsState }) => {

  const stories = [] as any [];
    for(let i=0;i<20;i++){
      stories.push({
            image:null
        });
    }
  // const { data, setLoginUser } = LoginUserHook();

  // const [loginData, setLoginData] = useState(null);
  // const [suggestions, setSuggestions] = useState(null);
  // const [feed, setFeed] = useState(null);

  // const updateLoginUser = (data: any) => {
  //   setLoginUser(data);
  //   setLoginData(data);
  // };
  // useEffect(() => {
  //   if (Example) {
  //     Example.echo({ value: 'Example plugin detected' }).then(data => {
  //       console.log(data);
  //     });
  //   }
  // setLoginData({username:'username'});
  // }, []);


  // useEffect(() => {
  //   fetch("/api/loginUser")
  //     .then((response) => response.json())
  //     .then((data) => updateLoginUser(data));

  //   fetch("/api/feed")
  //     .then((response) => response.json())
  //     .then((data) => setFeed(data));

  //   fetch("/api/suggestions")
  //     .then((response) => response.json())
  //     .then((data) => setSuggestions(data));
  // }, []);


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

export default connect(mapStateToProps)(Home);
