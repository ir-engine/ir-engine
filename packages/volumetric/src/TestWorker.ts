const ctx: Worker = self as any;
ctx.addEventListener('message', (event) => {
  console.log('Inside worker');
  console.log(event);
});

// export default {} as typeof Worker & (new () => Worker);
