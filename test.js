var assert = require( "assert" );
var wdlstream = require( "./index" )

var FIELDS_LINE = "#Fields: test omega beta\n"

it( "parses a single inline logline", function ( done ) {
    var results = [];
    wdlstream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [
                { 
                    test: "passed",
                    omega: "lili",
                    beta: "alpha"
                }
            ]);
            done();
        })
        .end( FIELDS_LINE + "passed\tlili\talpha" )
})

it( "parses multi-line logs", function ( done ) {
    var results = [];
    wdlstream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [
                { test: "world" },
                { test: "bar" },
            ]);
            done();
        })
        .end( FIELDS_LINE + "world\nbar" )
})

it( "disregards '-' elements", function ( done ) {
    var results = [];
    wdlstream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [
                { 
                    test: "world",
                    beta: "alpha"
                },
            ]);
            done();
        })
        .end( FIELDS_LINE + "world\t-\talpha" )
})

it( "streams partial data", function ( done ) {
    var results = [], initial, partial;
    var stream = wdlstream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( initial, [] );
            assert.deepEqual( initial2, [] );
            assert.deepEqual( partial, [
                { test: "hello", omega: "mastic", beta: "orange" },
            ]);
            assert.deepEqual( results, [
                { test: "hello", omega: "mastic", beta: "orange" },
                { test: "1", omega: "2", beta: "3" },
            ]);
            done();
        });
    stream.write( FIELDS_LINE );
    stream.write( "hello\tmasti" );
    initial = results.slice(); // copy the results at this point

    stream.write( "c\torange" );
    initial2 = results.slice(); // copy the results at this point

    stream.write( "\n1\t2\t3" );
    partial = results.slice(); // copy the results at this point

    stream.end();
})
