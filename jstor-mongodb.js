import { MongoClient} from "mongodb";
let mongoConnectionCache = null;

export default function(options = {}){

    //ensure table name!
    if(options.uri) options.url = options.uri;
    if(!options.url) options.url = process.env.MONGO_URL || process.env.MONGO_URL;
    if(!options.url) throw new Error(`jstor mongodb: A mongodb url is required to use the mongodb strategy`);

    //other options
    if(!options.dbName) options.dbName = 'jstor'
    if(!options.collection) options.collection = 'jstorCollection';
    if(!options.keyAttribute) options.keyAttribute = '_id';

    return function(store){

        const defaultStoreOptions = {
            cacheOptions: {
                files: {
                    maxAge: (5 * 60) //cache documents for 5 minute
                },
                keys: {
                    maxAge: (15 * 60) //only update the keys every 15 minutes
                }
            }
        };
        store.setOptions(Object.assign(defaultStoreOptions, options));
        if(!mongoConnectionCache) mongoConnectionCache = new store.Cache();
        store.client = mongoConnectionCache.getKey(options.url);
        if(!store.client){
            store.client = new MongoClient(options.url);
            mongoConnectionCache.setKey(options.url, store.client);
        }

        let mongoConnectionState;
        async function getMongoCollection(){
            return mongoConnectionState ||
                (
                    mongoConnectionState = store.client
                        .connect()
                        .then(client => client.db(options.dbName))
                        .then(db => db.collection(options.collection))
                );
        }

        function getSearchDocument(key){
            return key ? {
                [options.keyAttribute]: key
            } : {}
        }

        const exports = {

            async get(key){
                const collection = await getMongoCollection();
                const searchDoc = getSearchDocument(key);
                const data = await collection.findOne(searchDoc);
                return data;
            },

            async save(key, document){
                const collection = await getMongoCollection();
                const searchDoc = getSearchDocument(key);
                const documentUpdate = Object.assign({}, searchDoc, document);
                return collection.updateOne(searchDoc, {$set: document}, {upsert: true});
            },

            async remove(key){
                const collection = await getMongoCollection();
                const searchDoc = getSearchDocument(key);
                return collection.deleteOne(searchDoc);
            },

            async keys(){
                const collection = await getMongoCollection();
                const searchDoc = getSearchDocument();
                const projection = {[options.keyAttribute]:1};
                const keys = await collection
                    .find(searchDoc, {projection})
                    .toArray();
                return Array.isArray(keys) ?
                    keys.map(key => key[options.keyAttribute]) :
                    [];
            },

            //query will be database type specific
            async find(query, start, n){
                const collection = await getMongoCollection();
                const docs = await collection
                    .find(query)
                    .skip(start || 0)
                    .limit(n || 10000)
                    .toArray();
                return Array.isArray(docs) ?
                    docs.map(document => ({key: document[options.keyAttribute], document: document})) :
                    []
            },

            async batch(ids){
                const query = {
                    [options.keyAttribute]: {'$in': ids}
                };
                return exports.find(query);
            },

            async findOne(query){
                const collection = await getMongoCollection();
                const document = await collection.findOne(query);
                return document ?
                    {key: document[options.keyAttribute], document: document} :
                    null;
            }

        };

       return exports;
    }

}