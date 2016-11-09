var util = require( "util" );
var stream = require( "stream" );

module.exports = wdlstream;
module.exports.Stream = Stream;

var NEW_LINE = new Buffer( "\n" )[ 0 ]
var FIELDS_WORD = "#Fields:";

function wdlstream ( options ) {
    return new Stream( options )
}

util.inherits( Stream, stream.Transform );
function Stream( options ) {
    options || ( options = {} );
    options.readableObjectMode = true;

    stream.Transform.call( this, options )
    this.buf = new Buffer( "" );
    this.headers = null;
}

Stream.prototype._transform = function( data, enc, done ) {

    // prepend the left-over characters from the previous iteration
    data = Buffer.concat( [ this.buf, data ] );

    // parse the internal logs separated by new lines
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

    // it is a command
    if ( data[ 0 ] == "#" ) {
        var fieldsIndex = data.indexOf(FIELDS_WORD);
        // FIELDS command will tell us the headers
        if (fieldsIndex > -1) {
            // remove the '#Fields: ' word (including the whitespace hence +1)
            data = data.slice(fieldsIndex + FIELDS_WORD.length + 1)
            // set headers(fields)
            this.headers = data.split(' '); // whitespace separated
        }
    // it is a data row
    } else if ( data.length ) {
        var result = {};
        var parts = data.split("\t"); // tab separated
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] == '-') {
                continue; // it means empty value
            }
            result[this.headers[i]] = decodeURI(parts[i]);
        }
        return result;
    }
}
