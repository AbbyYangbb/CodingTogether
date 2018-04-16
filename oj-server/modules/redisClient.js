let redis = require('redis');
let client = redis.createClient();
// create one object to read client
// do not recommend to create "createClient" everytime,
// better way is to create one(wrapped like this), and then export

// like a hashset to pair the key-value
// then callback
let set = (key, value, callback) => {
    client.set(key, value, (err, res) => {
        if (err) {
                console.log(err);
                return;
            }
            callback(res);
    });
};

// get based on the key, and return a result in callback form
let get = (key, callback) => {
    client.get(key, (err, res) => {
        if (err) {
                console.log(err);
                return;
            }
            callback(res);
    })
};

// saving time period
let expire = (key, timeInSeconds) => {
    client.expire(key, timeInSeconds);
};

// close
let quit = () => client.quit();

// export 
module.exports = {
    get,
    set,
    expire,
    quit,
    redisPrint: redis.print // redis status
};
