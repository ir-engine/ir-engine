const ctx = self;
ctx.addEventListener('message', (event) => {
    console.log('Inside worker');
    console.log(event);
});
export default {};
