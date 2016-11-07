var util = require( "util" );
var stream = require( "stream" );

module.exports = wdlstream;
module.exports.Stream = Stream;

var NEW_LINE = new Buffer( "\n" )[ 0 ]

function wdlstream ( options ) {
    return new Stream( options )
}

util.inherits( Stream, stream.Transform );
function Stream( options ) {
    options || ( options = {} );
    options.readableObjectMode = true;

    stream.Transform.call( this, options )
    this.buf = new Buffer( "" );
}

Stream.prototype._transform = function( data, enc, done ) {

    // prepend the left-over characters from the previous iteration
    data = Buffer.concat( [ this.buf, data ] );

    // parse the internal querystrings separated by new lines
    var start = 0;
    for ( var i = 0 ; i < data.length ; i += 1 ) {
        if ( data[ i ] === NEW_LINE ) {
            var d = data.slice( start, i );
            var obj = this._parse( d );
            if ( obj ) {
                this.push( obj );
            }
            start = i + 1;
        }
    }

    // keep any extra unparsed characters for the next iteration
    this.buf = data.slice( start );

    done();
};

Stream.prototype._flush = function ( done ) {
    var obj = this._parse( this.buf );

    if ( obj ) {
        this.push( obj );
    }

    done();
}

Stream.prototype._parse = function ( data ) {
    data = data.toString().trim()

    // disregard the question mark prefix
    if ( data[ 0 ] == "?" ) {
        data = data.slice( 1 );
    }

    if ( data.length ) {
        return data;
    }
}
