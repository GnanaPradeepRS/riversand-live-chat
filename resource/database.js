const MongoClient = require('mongodb').MongoClient;

class Database {
    #url;
    constructor(){
        this.#url = "mongodb://mongodbapiwithcosmo:mpVTq6s4YuoNNmvJPnRb9fQi8nh17UvTZ94NFDzosUvt2TKdZ0XzkZfHsqzY0ym31UhJXKTz1duO0ka5JV15ow==@mongodbapiwithcosmo.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@mongodbapiwithcosmo@";
    }

    #connect = async(url) => {
        return MongoClient.connect(url)
        .then(client => {
            let db = client.db('TeamsNotificationDB');
            let collection = db.collection('TeamsUserRecords')
            return collection;
        })
    }

    async connection(){
        let connect = await this.#connect(this.#url);
        return connect;
    }
}

module.exports.Database = Database