import { setup, cleanup } from './helpers.js';

describe('[Security Rules] /{document=**}', () => {
	const dummyColPath = 'dummyCollection';
	const dummyDocPath = `${dummyColPath}/dummyDocument`;
	const dummyData = {};

	afterEach(async () => {
		await cleanup();
	});

	it('should deny read/write unauthorized collections.', async () => {
		expect.assertions(5);

		const db = await setup();
		const colRef = db.collection(dummyColPath);
		const docRef = db.doc(dummyDocPath);

		await expect(colRef.get()).toDeny();
		await expect(docRef.get()).toDeny();
		await expect(colRef.add(dummyData)).toDeny();
		await expect(docRef.update(dummyData)).toDeny();
		await expect(docRef.delete()).toDeny();
	});
});
