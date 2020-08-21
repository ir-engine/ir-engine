import React, { PureComponent } from 'react';

export default class SimpleTimeSeriesChart extends React.Component {
  constructor(props) {
    super(props);

    this.min = Number.MAX_VALUE;
    this.max = Number.MIN_VALUE;
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  componentDidMount() {
    let canvas = this.canvas = this.refs.canvas;
    let ctx = this.ctx = canvas.getContext("2d");

    this.max = 0;
    this.current = 0;

    let _def = {};

    //_def.color = '#EB932C';
    var c = _def.color ? _def.color : '#666666';

    this._elHeight = 20;
    this._elWidth = 200;

    this.dotCanvas = document.createElement( 'canvas' );
    let _dotCtx = this.dotCanvas.getContext( '2d' );
    this.dotCanvas.width = 1;
    this.dotCanvas.height = 2 * this._elHeight;
    _dotCtx.fillStyle = '#444444';
    _dotCtx.fillRect( 0, 0, 1, 2 * this._elHeight );
    _dotCtx.fillStyle = c;
    _dotCtx.fillRect( 0, this._elHeight, 1, this._elHeight );
    _dotCtx.fillStyle = '#ffffff';
    _dotCtx.globalAlpha = 0.5;
    _dotCtx.fillRect( 0, this._elHeight, 1, 1 );
    _dotCtx.globalAlpha = 1;

    this.alarmCanvas = document.createElement( 'canvas' );
    let _alarmCtx = this.alarmCanvas.getContext( '2d' );
    this.alarmCanvas.width = 1;
    this.alarmCanvas.height = 2 * this._elHeight;
    _alarmCtx.fillStyle = '#444444';
    _alarmCtx.fillRect( 0, 0, 1, 2 * this._elHeight );
    _alarmCtx.fillStyle = '#b70000';
    _alarmCtx.fillRect( 0, this._elHeight, 1, this._elHeight );
    _alarmCtx.globalAlpha = 0.5;
    _alarmCtx.fillStyle = '#ffffff';
    _alarmCtx.fillRect( 0, this._elHeight, 1, 1 );
    _alarmCtx.globalAlpha = 1;

    canvas.width = this._elWidth;
    canvas.height = this._elHeight;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    ctx.fillStyle = '#444444';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    this.updateCanvas();
  }

  updateCanvas() {
    let alarm = false;
    let canvas = this.canvas;
    let value = this.props.currentValue;
    let ctx = this.ctx;

    this.current += ( value - this.current ) * 0.1;
    this.max *= 0.99;
    if ( this.current > this.max ) this.max = this.current;
    ctx.drawImage( canvas, 1, 0, canvas.width - 1, canvas.height, 0, 0, canvas.width - 1, canvas.height );

    if ( alarm ) {
      ctx.drawImage( this.alarmCanvas, canvas.width - 1, canvas.height - this.current * canvas.height / this.max - this._elHeight );
    } else {
      ctx.drawImage( this.dotCanvas, canvas.width - 1, canvas.height - this.current * canvas.height / this.max - this._elHeight );
    }

    /*
    this.min = Math.min( this.min, value );
    this.max = Math.max( this.max, value );

    let maxValue = max;

    context.fillStyle = bg;
    context.globalAlpha = 1;

    context.fillStyle = `#EB932C`;
    context.drawImage( canvas,
      GRAPH_X + PR, GRAPH_Y, // sx, sy
      GRAPH_WIDTH - PR, GRAPH_HEIGHT, // sw, sh
      GRAPH_X, GRAPH_Y, // dx, dy
      GRAPH_WIDTH - PR, GRAPH_HEIGHT // dw, dh
    );

    //if (this.previousMax )

    context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );
    */
  }

  render() {
    return (
        <canvas ref="canvas" width={300} height={300}/>
    );
  }
}
