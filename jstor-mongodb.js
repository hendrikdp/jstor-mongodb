import { MongoClient} from "mongodb";

export default function(options = {}){

    //ensure table name!
    if(options.uri) options.url = options.uri;
    if(!options.url) options.url = process.env.MONGO_URL || process.env.MONGO_URL;
    if(!options.url) throw new Error(`jstor mongodb: A mongodb url is required to use the mongodb strategy`);

    //other options
    if(!options.dbName) options.dbName = 'jstor'
    if(!options.collection) options.collection = 'jstorCollection';
    if(!options.keyAttribute) options.keyAttribute = '_id';

    const mongo = new MongoClient(options.url);

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

        let mongoConnectionState;
        async function getMongoCollection(){
            return mongoConnectionState ||
                (
                    mongoConnectionState = mongo
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

        return {

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
                const keys = await collection.find(searchDoc, {projection}).toArray();
                return Array.isArray(keys) ?
                    keys.map(key => key[options.keyAttribute]) :
                    [];
            },

            async all(start, n, reverse){
                //if this function does not exist, jstor will use the keys()/batch() call!
                //make sure to return the objects in this format:
                //[{key, document}]
            },

            async batch(ids){
                //if this function does not exist, jstor will fetch document by document!
                //make sure to return the objects in this format:
                //[{key, document}]
            },

            //query will be database type specific
            async find(query){
                const collection = await getMongoCollection();
                const docs = await collection.find(query).toArray();
                return Array.isArray(docs) ?
                    docs.map(document => ({key: document[options.keyAttribute], document: document})) :
                    []
            },

            async findOne(query){
                //make sure to return the objects in this format:
                //{key, document}
            }

        };

    }

}