import { setup, cleanup } from './helpers.js';

describe('[Security Rules] /users/{userId}', () => {
	const mockUserId = '1234';
	const mockColPath = 'users';
	const mockDocPath = `${mockColPath}/${mockUserId}`;
	const mockUserDoc = {};
	const mockAdminUserDoc = { admin: true };

	const getRefs = db => {
		const colRef = db.collection(mockColPath);
		const docRef = db.doc(mockDocPath);
		return { colRef, docRef };
	};

	afterEach(async () => {
		await cleanup();
	});

	it('should deny unauthenticated user to read/write unauthorized collections.', async () => {
		expect.assertions(5);

		const db = await setup();
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.get()).toDeny();
		await expect(docRef.get()).toDeny();
		await expect(colRef.add({})).toDeny();
		await expect(docRef.update({})).toDeny();
		await expect(docRef.delete()).toDeny();
	});

	it('should allow singedIn user to read.', async () => {
		expect.assertions(2);

		const auth = {
			uid: mockUserId
		};

		const db = await setup(auth);
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.get()).toAllow();
		await expect(docRef.get()).toAllow();
	});

	it('should allow authorized user to update.', async () => {
		expect.assertions(1);

		const auth = {
			uid: mockUserId
		};
		const mockData = {
			[mockDocPath]: mockUserDoc
		};

		const db = await setup(auth, mockData);
		const { docRef } = getRefs(db);

		await expect(docRef.set({})).toAllow();
	});

	it('should deny singedIn user to update different users document.', async () => {
		expect.assertions(1);

		const auth = {
			uid: 'abcd'
		};
		const mockData = {
			[mockDocPath]: mockUserDoc
		};

		const db = await setup(auth, mockData);
		const { docRef } = getRefs(db);

		await expect(docRef.set({})).toDeny();
	});

	it('should allow admin user to read/write.', async () => {
		expect.assertions(5);

		const auth = {
			uid: mockUserId
		};
		const mockData = {
			[mockDocPath]: mockAdminUserDoc
		};

		const db = await setup(auth, mockData);
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.get()).toAllow();
		await expect(docRef.get()).toAllow();
		await expect(colRef.add({})).toAllow();
		await expect(docRef.update({})).toAllow();
		await expect(docRef.delete()).toAllow();
	});

	it('shloud deny non-admin user to create/delete.', async () => {
		expect.assertions(2);

		const auth = {
			uid: mockUserId
		};
		const mockData = {
			[mockDocPath]: mockUserDoc
		};

		const db = await setup(auth, mockData);
		const { colRef, docRef } = getRefs(db);

		await expect(colRef.add({})).toDeny();
		await expect(docRef.delete()).toDeny();
	});
});
