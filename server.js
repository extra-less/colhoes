const ws = require("ws")
const express = require("express")

const expressServer = express()
const steamids = [];
const steamids_uuid = [];
let usercount = 0

const wsServer = new ws.Server({
    server: expressServer.listen(6969),
    host: "localhost",
    path: "/"
})

wsServer.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

function findByKey(key, value) {
    return (item, i) => item[key] === value
}

function contains(arr, key, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] === val) return true;
    }
    return false;
}

wsServer.on("connection", (w, req) => {
    console.log(req.headers['sec-websocket-key'])
    usercount = usercount + 1
    w.on("message", (msg) => {
        console.log("a")
        var as = JSON.parse(msg)
        console.log(as["msg_type"])
        if (as["msg_type"] == "add") {
            if (!steamids.includes(as["msg_data"])){
                steamids.push(as["msg_data"])
            } else {
                usercount = usercount - 1
            }

            if (!contains(steamids_uuid,"id", as["msg_data"])){
                var objtopush = {
                    "uid": req.headers['sec-websocket-key'],
                    "id": as["msg_data"]
                }
                steamids_uuid.push(objtopush);
                console.log(steamids_uuid)
            } 


            console.log(usercount)
            var bb = JSON.stringify(Object.assign({}, steamids))
            console.log(bb)
            wsServer.clients.forEach(function(client) {
                client.send(JSON.stringify({
                    amount: usercount,
                    ids: bb,
                }));
            }) 
        console.log(steamids)
        }
    })

    w.on('close', function(reasonCode, description) {
        console.log("someone closed")

        let findParams = findByKey('uid', req.headers['sec-websocket-key'])
        let index = steamids_uuid.findIndex(findParams)
        usercount = usercount - 1
            const index2 = steamids.indexOf(steamids_uuid[index].id);
            if (index2 > -1) { // only splice array when item is found
                steamids.splice(index2, 1); // 2nd parameter means remove one item only
            }

        console.log(index)
        console.log(steamids_uuid[index].id)
        steamids_uuid.splice(index, 1)
        console.log(steamids_uuid)
        console.log(steamids)

        var bb = JSON.stringify(Object.assign({}, steamids))
        console.log(bb)
        wsServer.clients.forEach(function(client) {
            client.send(JSON.stringify({
                amount: usercount,
                ids: bb,
            }));
        }) 

    })
})

expressServer.listen(() => console.log("listening..."))
