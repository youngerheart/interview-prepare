const Koa = require('koa');

const app = new Koa();

app.use(async (ctx, next) => {
  console.log('middleware 1 start and run next 1000ms delayed');
  await new Promise((resolve) => {
    setTimeout(async () => {
      await next();
      resolve();
    }, 1000)
  })
  console.log('middleware 1 end');
})

app.use(async (ctx, next) => {
  console.log('middleware 2 start');
  await next();
  console.log('middleware 2 end');
})

app.use((ctx, next) => {
  console.log('middleware 3 running');
  ctx.res.write('hello nodejs');
  ctx.res.end();
})

app.listen(3000, () => {
  console.log('koa demo was running');
})
