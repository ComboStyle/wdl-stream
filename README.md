# wdl-stream
Stream parsing of [Web Distribution Log](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html#LogFileFormat)
#### Usage

```
npm install wdl-stream
```

```javascript
var wdlstream = require( "wdl-stream" );

fs.createReadStream( "cloudfront.log" )
  .pipe( wdlstream() )
  .on( "data", function ( queryObject ) {
    // do something awesome
  })
```