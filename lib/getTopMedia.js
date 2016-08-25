const path = require('path');
const _ = require('lodash');

module.exports = function (entity, results) {
   var result = {};
  result.topTracks = [];
  result.topAlbums = [];
  result.image = path.join(process.cwd(), 'images/icon-isrc-circle.png');
  result.secondaryText = 'ISRC Artist';

  return result;
};
