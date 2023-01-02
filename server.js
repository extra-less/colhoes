const ws = require("ws")
const express = require("express")

const expressServer = express()
let usercount = 0

const wsServer = new ws.Server({
    server: expressServer.listen(6969),
    host: "localhost",
    path: "/"
})

wsServer.on("connection", (w) => {
    console.log("connect")
    usercount = usercount + 1
    console.log(usercount)
    wsServer.clients.forEach(function(client) {
        client.send(usercount);
    })

    w.on('close', function(reasonCode, description) {
        usercount = usercount - 1
        wsServer.clients.forEach(function(client) {
            client.send(usercount);
        })
        console.log("disconnect")
        console.log(usercount)
    })
})

expressServer.listen(() => console.log("listening..."))
