let redisClient = require('../modules/redisClient');

const TIMEOUT_IN_SECONDS = 7200;

module.exports = function (io) {
    /*io.on('connection', (socket) =>{
     console.log(socket);

     var message = socket.handshake.query['message'];
     console.log(message);

     io.to(socket.id).emit('message', 'hehe from server')
    // use socketId to
     })*/

    let collaborations = [];
    let socketIdToSessionId = [];

    let sessionPath = "/temp_sessions";

    io.on('connection', socket => {
        let sessionId = socket.handshake.query['sessionId'];

        socketIdToSessionId[socket.id] = sessionId;
        // add socket.id to corresponding collaboration session participant

        if (sessionId in collaborations) {
          // currentlt in collaborations, push socket.id
            collaborations[sessionId]['participants'].push(socket.id);
        } else {
            redisClient.get(sessionPath + '/' + sessionId, (data) => {
              // if the session exist in redis, restore from redis
                if (data) {
                    console.log("session terminated previously, pulling back from Redis");
                    console.log("data: " + JSON.stringify(data) +", type of data: "+ typeof(data));
                    collaborations[sessionId] = {
                        'cachedChangeEvents': JSON.parse(data),
                        'participants': []
                    };
                } else {
                    console.log("creating new session");
                    collaborations[sessionId] = {
                        'cachedChangeEvents': [],
                        'participants': []
                    };
                }
                collaborations[sessionId]['participants'].push(socket.id);
            });
        }


        // socket typechange event listeners
        socket.on('change', delta => {
            let sessionId = socketIdToSessionId[socket.id];

            if (sessionId in collaborations) {
                collaborations[sessionId]['cachedChangeEvents'].push(["change", delta, Date.now()]);
            }

            forwardEvents(socket.id, "change", delta);
            // above function is defined belows
        });

        // socket cursor event listeners
        socket.on('cursorMove', cursor => {
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socket.id;
            forwardEvents(socket.id, "cursorMove", JSON.stringify(cursor));

        });

        socket.on('restoreBuffer', () => {
            let sessionId = socketIdToSessionId[socket.id];
            console.log('restoring buffer for session: ' + sessionId + ' socket: ' + socket.id);
            if (sessionId in collaborations) {
                let changeEvents = collaborations[sessionId]['cachedChangeEvents'];
                for (let i = 0; i < changeEvents.length; i++) {
                    socket.emit(changeEvents[i][0], changeEvents[i][1]);
                }
            }
        })

        socket.on('disconnect', () => {
            let sessionId = socketIdToSessionId[socket.id];
            console.log('socket ' + socket.id + ' disconnected.');

            if (sessionId in collaborations) {
                let participants = collaborations[sessionId]['participants'];
                let index = participants.indexOf(socket.id);
                if (index >= 0) {
                    participants.splice(index, 1);  // delete the last current user, and see whether there is other user left
                    if (participants.length == 0) {
                        console.log("Last participant left, store data to redis. cache => local");
                        let key = sessionPath + "/" + sessionId;
                        let value = JSON.stringify(collaborations[sessionId]['cachedChangeEvents']);
                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SECONDS);
                        delete collaborations[sessionId]; // delete from the memory
                    }
                }

            }
        })

        // Similar codes here
        function forwardEvents(socketId, eventName, dataString) {
            //console.log(JSON.parse(dataString)['userLogin']);
            //if (JSON.parse(dataString)['userLogin']) {
                JSON.stringify(dataString);
                console.log(eventName + socketIdToSessionId[socketId] + " : " + dataString);
                let sessionId = socketIdToSessionId[socketId];

                if (sessionId in collaborations) {
                    let participants = collaborations[sessionId]['participants'];
                    for (let i = 0; i < participants.length; i++) {
                        if (socketId != participants[i]) {
                            io.to(participants[i]).emit(eventName, dataString);
                        }
                    }
                } else {
                    console.log("WARNING: Could not tie socketId to any collaboration");
                }
            //}else{
            //    console.log("Unauthorized user, save data to local. ")
            //}
        }

    })
}
