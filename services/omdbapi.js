var axios = require('axios');
var youtube = require('./youtube');
var result = {};
const TOO_MANY_RESULTS_ERROR = "Too many results.";

const search = async (query, releaseYear, page) => {

  await axios.get(buildReqUrl(query, releaseYear, page))
    .then(response => {

      if (response.data.hasOwnProperty("Error")) {

        result.error = response.data.Error;

        // Checking because of contact form
        if (result.error === TOO_MANY_RESULTS_ERROR) {
          result.too_many_results = true;
        } else {
          if (result.hasOwnProperty("too_many_results")) {
            delete result.too_many_results;
          }
        }

        return;
      }

      result = {
        total_movies: response.data.totalResults,
        total_pages: Math.ceil(response.data.totalResults / 10),
        movies: [],
      };

      response.data.Search.forEach(item => {
        result.movies.push({
          id: item.imdbID,
          title: item.Title,
          poster: item.Poster,
          year: item.Year,
        });
      });
    })
    .catch(console.error);

  return result;
}

const searchById = async (imdbId) => {

  await axios.get(buildReqUrlOnlyId(imdbId))
    .then(response => {

      if (response.data.hasOwnProperty("Error")) {
        result.error = response.data.Error;
        return;
      }

      result = {
        id: response.data.imdbID,
        title: response.data.Title,
        year: response.data.Year,
        released: response.data.Released,
        runtime: response.data.Runtime,
        genre: response.data.Genre,
        plot: response.data.Plot,
        awards: response.data.Awards,
        poster: response.data.Poster,
        rating: response.data.imdbRating,
        search: response.data.Title + " " + response.data.Year + " trailer",
      }
    })
    .catch(console.error);

  result.videos = await youtube.search(result.search);

  return result;
}

const buildReqUrl = (query, releaseYear, page, onlyId = false, id = null) => {

  let baseUrl = "http://www.omdbapi.com/";
  let apiKey = process.env.OMDB_API_KEY;
  let s = query;
  let y = releaseYear;
  let url = baseUrl + "?apikey=" + apiKey;

  if (onlyId) {
    return url += "&i=" + id + "&plot=full";
  }

  if (!onlyId) {
    url += "&s=" + query;
  }

  if (releaseYear != null) {
    url += "&y=" + releaseYear;
  }

  url += "&page=" + page;

  return url;
}

const buildReqUrlOnlyId = (id) => {
  return buildReqUrl(null, null, null, true, id);
}

module.exports = {
  search,
  searchById
}