const debug = require('debug')('bmi-plugin');
const getTopMedia = require('./lib/getTopMedia');
const request = require('superagent');
const _ = require('lodash');

const BASE_URI = 'https://scraper.seeddevs.com/isrc-';

var artistCache = {};

class BmiPlugin {

  search (entityType, query, cb) {

    debug(`performing ${entityType} search w query ${query}`);

    if (entityType === 'artist') {
      return request.get(`${BASE_URI}artist?name=${encodeURIComponent(query)}`, (err, res) => {
        if (err) return cb(err);

        let results = res.body;

        // Cherry-pick out just the artists
        var artists = results.displayDocs;
        _.each(artists, function(item) {
          item.name = item.artistName;
          item.humanhref = item.href = 'https://isrc.soundexchange.com/#!/search';
        });
        console.log(results)
        debug(`found ${artists.length} artists`);
        return cb(null, artists);
      });
    } else if (entityType === 'work') {
      return request.get(`${BASE_URI}title?name=${encodeURIComponent(query)}`, (err, res) => {

        let results = res.body;

        var titles = results.displayDocs;
        _.each(titles, function(item, index) {
          item.name = item.trackTitle;
          item.artist = item.artistName;
          item.humanhref = item.href = 'https://isrc.soundexchange.com/#!/search';
          item.workId = item.isrcCode;
        });
        return cb(null, titles);
      });
    }

    return cb(new Error('entity type not supported by spotify search plugin'));
  }

  getDetails (entity, cb) {

    if (entity.titles) {
      return cb(null, getTopMedia(entity, {}));
    } else if (artistCache[entity.link]) {
      return cb(null, getTopMedia(artistCache[entity.link], {}));
    } else {
      var searchUrl = `${BASE_URI}artist-single?url=${encodeURIComponent(entity.link)}`;
      return request.get(searchUrl, function(err, res) {
        if (err) return cb(err);
        let results = res.body;
        var artist = results.singleArtist;
        artistCache[entity.link] = artist;
        return cb(null, getTopMedia(artist, {}));
      });
    }

  }

}

module.exports = BmiPlugin;