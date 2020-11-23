const ctx: Worker = window.self as any;
ctx.addEventListener('message', (event) => {
  // do stuff
  console.log('3-3');
  console.log(event);
});

export default null as any;
