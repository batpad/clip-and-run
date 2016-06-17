var MapboxClient = require('mapbox');
var cuid = require('cuid');

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
        bulkUploadFeatures(client, dataset.id, featureCollection, 0, callback);
    });
};

var MAX_FEATURES = 100;
function bulkUploadFeatures(client, datasetId, featureCollection, startIndex, callback) {
    var featuresToUpload = featureCollection.features.slice(startIndex, startIndex + MAX_FEATURES);
    client.batchFeatureUpdate({
        'put': featuresToUpload
    }, datasetId, function(err, results) {
        if (err) {
            return callback(err);
        }
        if (featureCollection.features.length > (startIndex + MAX_FEATURES)) {
            bulkUploadFeatures(client, datasetId, featureCollection, startIndex + MAX_FEATURES, callback);
        } else {
            callback(null, datasetId);
        }
    });
}