var express = require('express');
var bodyParser = require('body-parser')

var app = express();

app.use(bodyParser.json())

// post a url
app.post('/url', function (req, res) {
  if (!req.body) return res.sendStatus(400)
  res.send('body: ' + req.body.url)
})

// post an actual image
app.post('/img', function (req, res) {
  if (!req.body) return res.sendStatus(400)
  res.send('welcome: ' + req.body.username)
})

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Clarifai client running on port 3000!');
});
