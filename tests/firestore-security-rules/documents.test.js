import { setup, cleanup } from './helpers.js';

describe('[Security Rules] /{document=**}', () => {
	const mockColPath = 'dummyCollection';
	const mockDocPath = `${mockColPath}/dummyDocument`;
	const dummyData = {};

	const getRefs = db => {
		const colRef = db.collection(mockColPath);
		const docRef = db.doc(mockDocPath);
		return { colRef, docRef };
	};

	afterEach(async () => {
		await cleanup();
	});

	it('should deny anyone to read/write unauthorized collections.', async () => {
		expect.assertions(5);

		const db = await setup();
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.get()).toDeny();
		await expect(docRef.get()).toDeny();
		await expect(colRef.add(dummyData)).toDeny();
		await expect(docRef.update(dummyData)).toDeny();
		await expect(docRef.delete()).toDeny();
	});
});
