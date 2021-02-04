import React from "react";
import {
  RecoilRoot
} from "recoil";
import "../styles/index.css";

export default function MyApp(props: any) {
const {
  Component,
  pageProps
} = props
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
