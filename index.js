var cityClipper = require('city-clipper');
var cuid = require('cuid');
var queue = require('queue-async');
var makeDataset = require('./lib/make-dataset');

/**
*
* Function takes a source FeatureCollection, and a FeatureCollection of polygons by which to clip the source.
* It uploads each clipped set of features as a Dataset, and augments and returns the polygon FeatureCollection
* with a dataset ID for each polygon containing features that are a part of it.
*
* @param source {FeatureCollection}
* @param polygons {FeatureCollection}
* @param callback {Function} Callback called with FeatureCollection
*/
module.exports = function(source, polygons, options, callback) {
    options = options || {};
    options.accessToken = options.accessToken || process.env.MapboxAccessToken;
    if (!options.accessToken) {
        return callback('No access token supplied');
    }
    var clippedPolys = cityClipper(source, polygons);
    var polygonsWithFeatures = [];
    var q = queue(5);
    clippedPolys.forEach(function(poly, index) {
        if (poly.features.length > 0) {
            polygons.features[index].properties.featureCount = poly.features.length;
            polygonsWithFeatures.push(polygons.features[index]);
            q.defer(makeDataset, poly, options);
        }
    });

    q.awaitAll(function(err, results) {
        if (err) {
            return callback(err);
        }
        results.forEach(function(result, index) {
            polygonsWithFeatures[index].properties.dataset = result;
        });
        return callback(null, {
            'type': 'FeatureCollection',
            'features': polygonsWithFeatures
        });
    });
};