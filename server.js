var express = require('express'),
    path = require('path'),
    _ = require('underscore'),
    child = require('child_process'),
    c = require('chalk'),
    pj = require('prettyjson');
pm2 = require('pm2'),
    dir = require('node-dir'),
    fs = require('fs-extra'),
    app = new express();

var SOURCE_APP = __dirname + '/__agar.io-clone',
    launchServer = require('./launchServer'),
    BASE_PORT = 5000,
    SERVERS_DIR = __dirname + '/__SERVERS',
    APP_PREFIX = '__agar_server_',
    re = new RegExp('^' + APP_PREFIX, 'g');


var appFilter = function(apps) {
    var A = apps;
    A = A.filter(function(app) {
        return String(app.name).match(re);
    });
    return A;
};


fs.mkdirsSync(SERVERS_DIR);
var filter = {
    recursive: false
}; //{match: '/__SERVERS/_[0-9]$/'};


var servers = [];


app.use(express.static('public_html'));

app.get('/', function(req, res) {
    return res.send('cool');
});
app.get('/api/server/new', function(req, res) {

var curServers = fs.readdirSync(SERVERS_DIR).filter(function(file) {
	    return fs.statSync(path.join(SERVERS_DIR, file)).isDirectory();
	      });


    var ID = curServers.length + 1;
    var PORT = BASE_PORT + ID;
    var newServerDir = SERVERS_DIR + '/_' + ID;
    fs.copy(SOURCE_APP, newServerDir, function(err) {
        if (err) return console.error(err);
	var cConfig = fs.readFileSync(newServerDir + '/config.json').toString();
	cConfig = JSON.parse(cConfig);
	cConfig.port = PORT;
	fs.writeFileSync(newServerDir + '/config.json', JSON.stringify(cConfig));
	console.log('wrote cConfig', cConfig);
        var S = {
            name: 'agar_server_' + ID,
            cwd: newServerDir,
            exec_mode: 'cluster',
            instances: 1,
            script: './bin/server/server.js',
            args: [],
            max_memory_restart: '100M'
        };
        launchServer(S, function(err, ok) {
            if (err) throw err;

            return res.send('started', S);
        });
    });
});

app.listen(3010);
