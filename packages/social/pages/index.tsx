
import React, { useState, useEffect } from "react";
import {Header} from "@xr3ngine/client-core/components/social/Header";
import {FeedMenu} from "@xr3ngine/client-core/components/social/FeedMenu";
import {Footer} from "@xr3ngine/client-core/components/social/Footer";

// import { Layout } from "@xr3ngine/client-core/components/social/Layout";
// import { Stories } from "@xr3ngine/client-core/components/social/Stories";
// import { FeedItem } from "@xr3ngine/client-core/components/social/FeedItem";
// import { HomeRightBar } from "@xr3ngine/client-core/components/social/HomeRightBar";
// import { MoreModalItems } from "@xr3ngine/client-core/components/social/more-modal";

// TODO: HANDLE
import { LoginUserHook } from "@xr3ngine/client-core/components/social/GlobalHook";

import { Plugins } from '@capacitor/core';

import styles from './index.module.scss'
const { Example } = Plugins;

export default function Home({ children }) {
  const { data, setLoginUser } = LoginUserHook();

  const [loginData, setLoginData] = useState(null);
  const [stories, setStories] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [feed, setFeed] = useState(null);

  const updateLoginUser = (data: any) => {
    setLoginUser(data);
    setLoginData(data);
  };
  useEffect(() => {
    if (Example) {
      Example.echo({ value: 'Example plugin detected' }).then(data => {
        console.log(data);
      });
    }
  setLoginData({username:'username'})
  }, []);


  useEffect(() => {
    fetch("/api/loginUser")
      .then((response) => response.json())
      .then((data) => updateLoginUser(data));

    fetch("/api/feed")
      .then((response) => response.json())
      .then((data) => setFeed(data));

    fetch("/api/suggestions")
      .then((response) => response.json())
      .then((data) => setSuggestions(data));

    fetch("/api/stories")
      .then((response) => response.json())
      .then((data) => setStories(data));
  }, []);


  return (<>
    <div className={styles.viewport}>
      <Header user={loginData} logo="/assets/logoBlack.png" />
      <FeedMenu />
      {/* <MoreModalItems /> */}
      {/* <Stories stories={stories} /> */}
      {/* <div className="homepage-feed lg:mr-8 flex flex-col ">
          {feed &&
            feed.map((item: any) => {
              return <FeedItem data={item} key={item.pid} />;
            })}
        </div> */}
      {/* <HomeRightBar data={suggestions} /> */}
      <Footer user={loginData} />
    </div>
  </>
  );
}
