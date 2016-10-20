var MapboxClient = require('mapbox');
var cuid = require('cuid');
var queue = require('d3-queue').queue;

/**
* Uploads a feature collection as a Mapbox Dataset.
* Calls callback with the created dataset id
*
*/
module.exports = function(featureCollection, options, callback) {
    var accessToken = options.accessToken || process.env.MapboxAccessToken;
    if (!accessToken) {
        return callback('No access token provided.');
    }
    var datasetName = options.name || 'Auto-name';
    var datasetDescription = options.description || '';
    var client = new MapboxClient(accessToken);
    featureCollection.features = featureCollection.features.map(function(feature) {
        feature.id = cuid();
        return feature;
    });
    client.createDataset({
        'name': datasetName,
        'description': datasetDescription
    }, function(err, dataset) {
        if (err) {
            return callback(err);
        }
        bulkUploadFeatures(client, dataset.id, featureCollection, callback);
    });
};

function bulkUploadFeatures(client, datasetId, featureCollection, callback) {
    var featuresToUpload = featureCollection.features;
    var q = queue(1);
    featuresToUpload.forEach(function(feature) {
        q.defer(client.insertFeature.bind(client), feature, datasetId);
    });
    q.awaitAll(function(err, results) {
        if (err) return callback(err);
        return callback(null, datasetId);
    });
}