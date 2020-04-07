import App from 'next/app';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { configureStore } from '../redux/store'
import { Store } from 'redux';

interface Props {
    store: Store;
}
class MyApp extends App<Props> {
  static async getInitialProps(props: any) {
    const { Component, ctx } = props;
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }
    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
        <Provider store={store}>
            <Component {...pageProps} />
        </Provider>
    );
  }
}

export default withRedux(configureStore, {
  serializeState: (state) => state.toJS(),
  deserializeState: (state) => fromJS(state),
})(MyApp);
