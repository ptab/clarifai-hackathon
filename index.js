var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs')
var request = require('request')
var uuid = require('node-uuid');

var apiUrl = 'https://api.imagga.com/v1'
var apiKey = 'acc_2ccbe14228845fa'
var apiSecret = '2543dc1e5b639941577ebb9e9a0427ff'

var app = express();

app.use(bodyParser.json({ limit: '50mb' }))

// post an actual image
app.post('/img', (req, res) => {
  if (!req.body) return res.sendStatus(400)

  var filename = '/tmp/image-' + uuid.v4() + '.jpg'

  fs.writeFile(filename, new Buffer(req.body.image, 'base64'), (err) => {
    if (err) return res.sendStatus(400)

    var post = {
      url: apiUrl + '/content',
      formData: {
        image: fs.createReadStream(filename)
      }
    }

    request.post(post, (error, response, body) => {
      if (error || !body) return res.sendStatus(400)

      request.get(apiUrl + '/tagging?content=' + JSON.parse(body).uploaded[0].id + '&language=nl', (error, response, body) => {
        if (error || !body) return res.sendStatus(400)
        else res.json(parse(JSON.parse(body)))
      }).auth(apiKey, apiSecret, true);
    }).auth(apiKey, apiSecret, true);
  })
})

app.listen(3000, () => {
  console.log('Image recognition server running on port 3000!');
})

function parse(json) {
  var blocked_tags = ['container', 'voertuig', 'overdracht', 'technologie', 'internet']
  var result = {}

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  result.keywords = json.results[0].tags
    .filter((t) => {
      var allowed = true
      blocked_tags.forEach((blocked) => {
        if (t.tag.indexOf(blocked) >= 0) allowed = false
      })
      return allowed
    })
    .map((t) => {
      return t.tag.trim()
    })
    .filter(onlyUnique)
    .slice(0, 3)

  console.log(result)
  return result
}
