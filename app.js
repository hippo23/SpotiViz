require('dotenv').config()

var express = require('express')
var request = require('request')
var cors = require('cors')
var querystring = require('querystring')

var client_id = process.env.CLIENT_ID // your clientId
var client_secret = process.env.CLIENT_SECRET // Your secret
var redirect_uri = 'http://localhost:3001/api/callback' // Your redirect uri

var app = express()

app.use(cors())
app.use(express.static('dist'))

app.get('/api/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        new Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    json: true,
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token

      var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { Authorization: 'Bearer ' + access_token },
        json: true,
      }

      // we can also pass the token to the browser to make requests from there
      res.redirect(
        `/pages/Data?` +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token,
          }),
      )
    } else {
      res.redirect(
        '/pages/Login' +
          querystring.stringify({
            error: 'invalid_token',
          }),
      )
    }
  })
})

app.get('/api/refresh_token', function (req, res) {
  var refresh_token = req.query.refresh_token
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        new Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token
      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      })
    }
  })
})

app.get('/api/get_top_tracks', (req, res) => {
  const access_token = req.query.token
  const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`

  var requestOptions = {
    url: TOP_TRACKS_ENDPOINT,
    headers: {
      Authorization: `Bearer ${access_token}`,
      limit: 5,
    },
    json: true,
  }

  request.get(requestOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.json(response)
    } else {
      console.log(response.statusCode)
    }
  })
})

app.get('/api/get_top_artists', (req, res) => {
  const access_token = req.query.token
  const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?limit=50`
  console.log('bruh')

  var requestOptions = {
    url: TOP_TRACKS_ENDPOINT,
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    json: true,
  }

  request.get(requestOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.json(response)
    } else {
      console.log(response.statusCode)
    }
  })
})

app.get('/api/get_saved_albums', (req, res) => {
  const access_token = req.query.token
  const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/albums`

  var requestOptions = {
    url: TOP_TRACKS_ENDPOINT,
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    json: true,
  }

  request.get(requestOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.json(response)
    } else {
      console.log(response.statusCode)
    }
  })
})

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html')
})

const PORT = process.env.PORT || 3001

console.log('Listening on', PORT)
app.listen(PORT)
