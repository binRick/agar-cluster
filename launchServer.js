var express = require('express'),
    _ = require('underscore'),
    child = require('child_process'),
    c = require('chalk'),
    pj = require('prettyjson');
dir = require('node-dir'),
    fs = require('fs-extra'),
    app = new express();

var SOURCE_APP = __dirname + '/__agar.io-clone',
    SERVERS_DIR = __dirname + '/__SERVERS',
    APP_PREFIX = '__agar_server_';


module.exports = function(S, _cb) {
    var server = child.exec('node ' + S.script, {
        cwd: S.cwd
    });
    server.on('close', function(code, signal) {
        console.log('server closed w code', code);
    });
    server.stdout.on('data', function(dat) {
        console.log(c.green('server out'), dat.toString());
    });
    server.stderr.on('data', function(dat) {
        console.log(c.red('server err'), dat.toString());
    });
    _cb(null, {});
};
