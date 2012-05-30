/*
 * Maps
 */
// Cache points for 30 seconds
var CACHE_TIME = 30;
var MARKERS = {
  locations: [
    {
      lat: '36.12242',
      lon: '-115.16975'
    },
    {
      lat: '36.12442',
      lon: '-115.17175'
    }
  ]
};

function getMarkers(params) {
  // Default to markers around Las Vegas
  var res = MARKERS;
  if( params.lat && params.lon ) {
    res = {};
    res.locations = [];
    var markerLat1 = params.lat - 0.002;
    var markerLon1 = params.lon - 0.002;
    res.locatios.push({'lat' : markerlat1, 'lon': markerlon1});
    
    var markerLat2 = params.lat + 0.002;
    var markerLon2 = params.lon + 0.002;
    res.locatios.push({'lat' : markerlat2, 'lon': markerlon2});
  }
  
  return res;
}

function getCachedPoints(params,callback) {
  $fh.cache({
    "act": "load",
    "key": "points"
  },function(err,res){
    callback(err,res);
  });
  
}

function cachePoints(hash, data) {
  var obj = {
    "hash": hash,
    "data": data,
    "cached": true
  };
  $fh.cache({
    "act": "save",
    "key": "points",
    "value": JSON.stringify(obj),
    "expire": CACHE_TIME
  }, function(err, res) {
    console.log('cachePoints :: err = ', err, ' :: res = ', res);
  });
}

function getPoints(params,callback) {
  
  var response = {};
  getCachedPoints({}, function(err, res) {
    console.log('getCachedPoints :: err = ', err, ' :: res = ', res);
    if( res ) {
      console.log('getPoints - cached response = ', res);
      // Parse the cached data
      var cache = JSON.parse(res);

      if( params.hash && params.hash === cache.hash ) {
        console.log('Hash check matches - Client data is up to date');
        response = {'hash':params.hash, 'cached':true};
      } else {
        // Hash value from client missing or incorrect, return cached cloud data
        response = cache;
      }      
    }
    else {
      var data = getMarkers(params);
      var crypto=require("crypto");
      var md5=crypto.createHash("md5");
      var hash=md5.update(JSON.stringify(data)).digest("hex");
      // Cache the data
      cachePoints(hash, data);
  
      // Build the response
      response = {'data': data, 'hash':hash, 'cached':false};
    } 
    callback(null, response);
  });
}

module.exports={
  getCachedPoints:getCachedPoints,
	getPoints:getPoints
};