### Clip and Run

A simple utility to split up a GeoJSON Feature Collection by a supplied list of polygons / areas, and create a Mapbox Dataset for each area.

### Install

```
npm install -g clip-and-run
```

### Usage:

First, set an environment variable called `MapboxAccessToken` with your access token, must have the `dataset:write` scope.

`clip-and-run <source.geojson> <polygons.geojson> -o <output.geojson>`

If you omit the `-o` option, it will output to `stdout`.

Additional options:

    --name : Name field for datasets created
    --description : Description field for datasets created
    -o : Output file to write to
    --accessToken : Supply access token as parameter if not setting environment variable
