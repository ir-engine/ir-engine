export default `
#ifdef USE_LOGDEPTHBUF
  #ifdef USE_LOGDEPTHBUF_EXT
    vFragDepth = 1.0 + gl_Position.w;
    vIsPerspective = 1.0;
  #else
    if ( isPerspectiveMatrix( projectionMatrix ) ) {
      gl_Position.z = log2( max( 0.0001, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
      gl_Position.z *= gl_Position.w;
    }
  #endif
#endif
`
