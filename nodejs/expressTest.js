const express = require('express')

const app = express()

app.use(async (req, res, next) => {
  console.log('middlewareA before next()')
  await next()
  console.log('middlewareA after next()')
})

app.use((req, res, next) => {
  console.log('middlewareB before next()')
  setTimeout(next, 1000)
  console.log('middlewareB after next()')
  res.write('hello nodejs')
  res.end()
})

app.listen(3000, function () {
  console.log('listen 3000...')
})
