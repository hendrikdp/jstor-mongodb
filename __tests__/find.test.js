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
        await store.save('key9', {name: 'de permentier', firstname: 'daniel'});
        await store.save('key10', {c: 'd'});
        //clear cache
        clearCache();
    });

    test(`FIND documents`, async () => {
        const files = await store.find({name: 'de permentier'});
        expect(files.length).toBeGreaterThan(1);
        expect(files[0].get('firstname')).toBe('hendrik')
    });

    test(`FIND a document, skip 1 document, take only 1`, async () => {
        const files = await store.find({name: 'de permentier'}, 1, 1);
        expect(files.length).toBe(1);
        expect(files[0].get('firstname')).toBe('peter')
    });

    test(`FIND non existing documents should return an empty array`, async () => {
        const files = await store.find({nonexitingfieeeeeld: ''}, 1, 1);
        expect(files.length).toBe(0);
    });

    test(`FIND documents, take only 2`, async () => {
        const files = await store.find({name: 'de permentier'}, null, 2);
        expect(files.length).toBe(2);
    });

    test(`FIND only the first document`, async () => {
        const file = await store.findOne({name: 'de permentier'}, null, 2);
        expect(file.get('firstname')).toBe('hendrik');
    });

});