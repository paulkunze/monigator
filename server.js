/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));   // set the main folder for serving static content

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');  // load the main file, Angular will handle the page changes
});

app.get('/*', function (req, res) {
  res.redirect('/');
});

app.listen(8000, function () {
  console.log('App listening on port 8000');
});


var cors_proxy = require('cors-anywhere');

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  removeHeaders: ['cookie', 'cookie2'],
  redirectSameOrigin: true	// don't proxy same origin requests
})
  .listen(8001);

console.log('Proxy running on port 8001');
