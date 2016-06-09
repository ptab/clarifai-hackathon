var express = require('express');
var bodyParser = require('body-parser')
var Clarifai = require('clarifai')

var app = express();

var clarifai = new Clarifai({
  id: 'lVVNrGfIo2iM1qWNzlUr8zUcKoVVratwnTm0Ue_u',
  secret: 'JJw9pZeQtOKSZyq9rurtqpxOHpruMAOnaDCBwZd7'
})

app.use(bodyParser.json({ limit: '50mb' }))

// post a url
app.post('/url', (req, res) => {
  if (!req.body) return res.sendStatus(400)

  var url = req.body.url

  clarifai.tagFromUrls('image', url, (err, result) => {
    if (err) res.json(err)
    else res.json(keywordsFrom(result))
  }, 'nl')
})

// post an actual image
app.post('/img', (req, res) => {
  if (!req.body) return res.sendStatus(400)

  // console.log('------ BODY START -------')
  // console.log(req.body.image)
  // console.log('------ BODY END -------')

  var image = new Buffer(req.body.image, 'base64')

  clarifai.tagFromBuffers('image', image, (err, result) => {
    if (err) res.json(err)
    else res.json(keywordsFrom(result))
  }, 'nl')
})

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Clarifai client running on port 3000!');
});

function keywordsFrom(json) {
  var result = {}

  // TODO 
  // - block tag geen personen
  // - strip stuff inside parentheses

  result.keywords = json.tags.slice(0, 5).map((tag) => {
    return tag.class
  })

  return result
}
