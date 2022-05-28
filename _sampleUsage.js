import Store from 'jstor';
import StrategyMongoDb from './jstor-mongodb.js';

export const store = new Store({
    strategy: StrategyMongoDb({
        url: 'mongodb://127.0.0.1:27017',
        dbName: 'jstorTestDb',
        collection: 'jstorTestCollection'
    })
});