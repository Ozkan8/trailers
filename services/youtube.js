var axios = require('axios');

const search = async (query) => {

  let results = [];

  await axios.get(buildReqUrl(), {
    params: {
      part: "snippet",
      order: "date",
      maxResults: "6",
      q: query,
      type: "video",
      videoEmbeddable: true
    }
  })
    .then(response => {
      response.data.items.forEach(video => {
        results.push({
          id: video.id.videoId,
          channel_title: video.snippet.channelTitle,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high.url,
          published_at: video.snippet.publishedAt
        })
      });
    })
    .catch(e => {
      console.log(e.response.data.error)
    });

  return results;
}

const buildReqUrl = (type = "search") => {

  let baseUrl = "https://www.googleapis.com/youtube/v3/" + type;
  let apiKey = process.env.YOUTUBE_API_KEY;
  let url = baseUrl + "?key=" + apiKey;

  return url;
}

module.exports = {
  search
}