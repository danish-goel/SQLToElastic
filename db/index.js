'use strict';
var configuration = require('../configuration');
var Promise = require('bluebird');
var elasticSearch = require('elasticsearch');
var mysql = require('mysql');
var elasticClient;

elasticClient = new elasticSearch.Client({
    host: configuration.elastic.url,
    log: [{
        type: 'stdio',
        levels: ['error'] // change these options
    }]
});


var connection = mysql.createConnection({
    host: configuration.mysql.host,
    user: configuration.mysql.user,
    password: configuration.mysql.password,
    database: configuration.mysql.database
});

connection.connect(function (err) {
    if (err) throw err;
});


exports.mysql = connection;
exports.elastic = elasticClient;


