var express = require('express');
var router = express.Router();
var { omdbapi } = require('../services');
var NodeCache = require("node-cache");
var cache = new NodeCache();
var nodemailer = require('nodemailer');

const { query, validationResult } = require('express-validator');

// Search movies
router.get('/search', function (req, res) {

  // Get result from cache
  if (cache.has(req.url)) {
    return res.send(JSON.parse(cache.get(req.url)));
  }

  async function getMovies() {

    let movies = {};

    // Check if imdb movie ID is provieded
    if (req.query.i) {
      movies = await omdbapi.searchById(req.query.i);
    } else { // Get movies by search query

      let releaseYear = req.query.y || null;
      let page = req.query.page || 1;

      if (page < 1) page = 1;

      movies = await omdbapi.search(req.query.s, releaseYear, page);
    }

    if (movies.hasOwnProperty("Error")) {
      return res.send({
        "error": movies.error
      });
    }

    // Set cache
    cache.set(req.url, JSON.stringify(movies));

    return res.send(movies);
  }

  getMovies();
});

// Contact form
router.get('/contact',
  query("from").isEmail(),
  query("movie").trim().notEmpty(),
  function (req, res) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({
        errors: errors.array()
      });
    }

    const { from, movie, message } = req.query;

    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });

    const mailData = {
      from: from,
      to: 'request@trailers.com',
      subject: 'Trailer Request!',
      html: '<b>From: </b>' + from + "<br/>" + "<b>Movie trailer request: </b>" + movie + "<br/>" + "<b>Message: </b>" + message,
    };

    transport.sendMail(mailData, (error, info) => {

      if (error) {
        return res.send({
          status: false
        })
      }

      return res.send(info);
    })
  })

module.exports = router;
