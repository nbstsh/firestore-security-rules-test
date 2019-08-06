import { setup, cleanup, generateRefs } from './helpers.js';

describe('[Security Rules] /{document=**}', () => {
	const mockColPath = 'dummyCollection';
	const mockDocumentId = 'dummyDocumentId';

	const getRefs = db => generateRefs(db, mockColPath, mockDocumentId);

	afterEach(async () => {
		await cleanup();
	});

	it('should deny anyone to read/write unauthorized collections.', async () => {
		expect.assertions(5);

		const db = await setup();
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.get()).toDeny();
		await expect(docRef.get()).toDeny();
		await expect(colRef.add({})).toDeny();
		await expect(docRef.update({})).toDeny();
		await expect(docRef.delete()).toDeny();
	});
});
