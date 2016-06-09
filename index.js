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

  clarifai.tagFromUrls('image', req.body.url, (err, result) => {
    if (err) res.json(err)
    else res.json(parseClarifai(result))
  }, 'nl')
})

// post an actual image
app.post('/clarifai-img', (req, res) => {
  if (!req.body) return res.sendStatus(400)

  clarifai.tagFromBuffers('image', new Buffer(req.body.image, 'base64'), (err, result) => {
    if (err) res.json(err)
    else res.json(parseClarifai(result))
  }, 'nl')
})

// post an actual image
app.post('/img', (req, res) => {
  if (!req.body) return res.sendStatus(400)

  var fs = require('fs')
  var request = require('request')
  var uuid = require('node-uuid');

  var apiKey = 'acc_2ccbe14228845fa'
  var apiSecret = '2543dc1e5b639941577ebb9e9a0427ff'

  var filename = '/tmp/image-' + uuid.v4() + '.jpg'

  fs.writeFile(filename, new Buffer(req.body.image, 'base64'), (err) => {
    if (err) return res.sendStatus(400)

    var post = {
      url: 'https://api.imagga.com/v1/content',
      formData: {
        image: fs.createReadStream(filename)
      }
    }

    request.post(post, (error, response, body) => {
      if (error || !body) return res.sendStatus(400)

      request.get('https://api.imagga.com/v1/tagging?content=' + JSON.parse(body).uploaded[0].id + '&language=nl', (error, response, body) => {
        if (error || !body) return res.sendStatus(400)
        else res.json(parseImagga(JSON.parse(body)))
      }).auth(apiKey, apiSecret, true);
    }).auth(apiKey, apiSecret, true);
  })
})

app.get('/usage', (req, res) => {
  clarifai.getAPIDetails((err, result) => {
    res.json(result)
  })
})

app.listen(3000, () => {
  console.log('Clarifai client running on port 3000!');
})

function parseClarifai(json) {
  var blocked_tags = ['geen persoon']
  var result = {}

  result.keywords = json.tags
    .filter((tag) => {
      return blocked_tags.indexOf(tag.class) == -1
    })
    .map((tag) => {
      var keyword = tag.class.replace(new RegExp('\\(.*\\)', 'gm'), '')
      keyword = keyword.trim()
      return keyword
    })
    .slice(0, 3)

  console.log(result)
  return result
}

function parseImagga(json) {
  var result = {}
  result.keywords = json.results[0].tags.slice(0, 5)
  return result
}
