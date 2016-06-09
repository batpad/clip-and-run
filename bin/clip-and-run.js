#!/usr/bin/env node

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var clipAndRun = require('..');

// console.log(argv);

var posParams = argv._;
if (posParams.length < 2) {
    return usage();
}

var source = posParams[0];
var polygons = posParams[1];
var sourceFC = JSON.parse(fs.readFileSync(source));
var polygonsFC = JSON.parse(fs.readFileSync(polygons));

var options = {
    'accessToken': argv.accessToken || process.env.MapboxAccessToken,
    'name': argv.name || null,
    'description': argv.description || ''
};

if (!options.accessToken) {
    return process.stdout.write('Please provide an access token with the --accessToken parameter or by setting an environment variable called MapboxAccessToken');
}

clipAndRun(sourceFC, polygonsFC, options, function(err, geojson) {
    if (err) {
        throw err;
    }
    var geojsonString = JSON.stringify(geojson, null, 2);
    if (argv.o) {
        fs.writeFileSync(argv.o, geojsonString);
        console.log('output written to file: ' + argv.o);
        process.exit(0);
    } else {
        console.log(geojsonString);
    }
});

function usage() {
    process.stdout.write('clip-and-run <source.geojson> <polygons.geojson>\n');
}