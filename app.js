var express = require('express');
var app = express();
var mysql = require('./db').mysql;
var Promise = require('bluebird');
var elastic = require('./db').elastic;

var limit = 1000;
var lastnid = 0;

function recurseDocs(limit) {
    getDocs(limit)
        .then((data) => {
            if (data && data == 0) {
                console.log("done");
            }
            else {
                sendBulkQuery(data, elastic, limit)
                    .then(() => {
                        recurseDocs(limit);
                    })
                    .catch(err => {
                        throw err;
                    })
            }
        })
        .catch(err => {
            throw err;
        });
}

recurseDocs(limit);

function getDocs(limit) {

    return new Promise(function (resolve, reject) {

        var query = 'SELECT * from topstory_main where id >' + lastnid + ' ORDER BY id ASC LIMIT ' + limit;
        mysql.query(query, function (err, rows, fields) {
            if (err) {
                return reject(err);
            }

            if (rows && rows.length >= 0) {


                var data = [];
                for (var i = 0; i < rows.length; i++) {
                    // console.log(rows[i]);
                    var obj = {};
                    lastnid = rows[i].id;
                    obj.id = lastnid;
                    obj.cat_id = rows[i].cat_id;
                    obj.header_update = rows[i].header_update;
                    obj.common_id = rows[i].common_id;
                    obj.headline = rows[i].headline;
                    obj.story_url = rows[i].story_url;
                    obj.app = rows[i].app;
                    obj.crtd_by = rows[i].crtd_by;
                    obj.changed = rows[i].crtd_date;
                    obj.lst_mod_by = rows[i].lst_mod_by;
                    obj.lst_mod_date = rows[i].lst_mod_date;
                    data.push(obj);
                }
                return resolve(data);
            }

            else {
                return resolve(0);
            }
        });

    });


}



function sendBulkQuery(documents, client, limit) {
    //base case
    // if (documents.length == 0) {
    //     return null;
    // }
    // var end;
    // if (documents.length < limit) {
    //     end = documents.length;
    // }
    // else {
    //     end = limit;
    // }
    // var nextDocs = documents.splice(0, end);

    var bulkQueryBody = [];
    for (let index = 0; index < documents.length; index++) {
        var config = { index: { _index: 'notif', _type: 'notif' } };
        let doc = documents[index];
        config['index']['_id'] = doc.id;
        delete doc.id;
        bulkQueryBody.push(config)
        bulkQueryBody.push(doc);
    }

    // console.log(bulkQueryBody);
    return client.bulk({
        body: bulkQueryBody
    })
        .then(response => {
            console.log('Wrote ' + response.items.length + " documents");
            console.log('Time taken ' + response.took + " ms");
            console.log('');
            // sendBulkQuery(documents, client, limit);

        })
        .catch((err) => {
            console.log(err);
        })

}
