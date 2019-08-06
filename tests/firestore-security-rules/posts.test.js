import { setup, cleanup, generateRefs } from './helpers.js';

describe('[Security Rules] /posts/{postId}', () => {
	const mockColPath = 'posts';
	const mockDocumentId = '1234';
	const mockDocPath = `${mockColPath}/${mockDocumentId}`;

	const getRefs = db => generateRefs(db, mockColPath, mockDocumentId);

	afterEach(async () => {
		await cleanup();
	});

	it('should deny unauthenticated user to read/write.', async () => {
		expect.assertions(5);

		const db = await setup();
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.get()).toDeny();
		await expect(docRef.get()).toDeny();
		await expect(colRef.add({})).toDeny();
		await expect(docRef.update({})).toDeny();
		await expect(docRef.delete()).toDeny();
	});

	it('should allow anyone to read published post.', async () => {
		expect.assertions(2);

		const mockPublishedPost = { isPublished: true };
		const mockData = { [mockDocPath]: mockPublishedPost };

		const db = await setup(null, mockData);
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.where('isPublished', '==', true).get()).toAllow();
		await expect(docRef.get()).toAllow();
	});

	// create operation can not be done because the resource needs to exist before the operation.
	it('should allow author to read/write.', async () => {
		expect.assertions(4);

		const authorId = '1234';
		const mockPublishedPost = { authorId };
		const mockData = { [mockDocPath]: mockPublishedPost };

		const db = await setup({ uid: authorId }, mockData);
		const { docRef, colRef } = getRefs(db);

		await expect(colRef.where('authorId', '==', authorId).get()).toAllow();
		await expect(docRef.get()).toAllow();
		await expect(docRef.update({})).toAllow();
		await expect(docRef.delete()).toAllow();
	});

	it('shloud deny user to write post of others users.', async () => {
		expect.assertions(3);

		const authorId = '1234';
		const mockPublishedPost = { authorId };
		const mockData = { [mockDocPath]: mockPublishedPost };

		const db = await setup({ uid: 'differentUserId' }, mockData);
		const { docRef, colRef } = getRefs(db);

		await expect(colRef.add({})).toDeny();
		await expect(docRef.update({})).toDeny();
		await expect(docRef.delete()).toDeny();
	});

	it('shloud deny any user to read unpublished post of other users.', async () => {
		expect.assertions(2);

		const mockPublishedPost = {
			isPublished: false,
			authorId: 'otherUserId'
		};
		const mockData = { [mockDocPath]: mockPublishedPost };

		const db = await setup({ uid: '1234' }, mockData);
		const { docRef, colRef } = getRefs(db);

		await expect(colRef.get()).toDeny();
		await expect(docRef.get()).toDeny();
	});
});
