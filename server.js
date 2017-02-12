var express = require('express')
var cp = require('child_process')
var app = express()

app.get('/filebot', function (req, res) {
  console.log('done')
  res.send('ok')
  cp.exec('sh /volume1/homes/admin/script/sort-media.sh')
})

app.listen(7777, function () {
  console.log('Example app listening on port 7777!')
})
