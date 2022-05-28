import { store } from "../_sampleUsage.js"

function clearCache(){
    store.fileCache.clear();
    store.keysCache.clear();
}

describe(`JStore - Find documents`, () => {

    beforeAll(async () => {
        //CREATE DOCUMENTS
        await store.save('key7', {name: 'de permentier', firstname: 'hendrik'});
        await store.save('key8', {name: 'de permentier', firstname: 'peter'});
        await store.save('key9', {c: 'd'});
        //clear cache
        clearCache();
    });

    test(`FIND a document`, async () => {
        const files = await store.find({name: 'de permentier'});
        expect(files.length).toBeGreaterThan(1);
        expect(files[0].get('firstname')).toBe('hendrik')
    });

});