import Store from 'jstor';
import StrategyMongoDb from './jstor-mongodb.js';

export const store = new Store({
    strategy: StrategyMongoDb({
        url: 'mongodb://127.0.0.1:27017',
        dbName: 'jstorTestDb',
        collection: 'jstorTestCollection',
        maxBatchSize: 20 //whenever elements are batch fetched, take max 2 only per batch (default is 50)
    })
});