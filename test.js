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
            assert.deepEqual( partial, [
                { hello: "world", foo: "bar" }
            ]);
            assert.deepEqual( results, [
                { hello: "world", foo: "bar" },
                { cookie: "monster" }
            ])
            done();
        });
        
    stream.write( "hello=world&foo" );
    initial = results.slice(); // copy the results at this point

    stream.write( "=bar\ncookie=monster" );
    partial = results.slice(); // copy the results at this point

    stream.end();
})
