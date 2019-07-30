import * as firebase from '@firebase/testing';
import * as fs from 'fs';

// mock dataを流し込む
const seedMockData = async (db, data) => {
	for (const docPath in data) {
		const ref = db.doc(docPath);
		await ref.set(data[docPath]);
	}
};

// security rulesを読み込む
const loadRules = async projectId => {
	await firebase.loadFirestoreRules({
		projectId,
		rules: fs.readFileSync('firestore.rules', 'utf8')
	});
};

// set up Firebase app helper
export const setup = async (auth, data) => {
	const projectId = `rules-test-${Date.now()}`;
	const app = firebase.initializeTestApp({
		projectId,
		auth
	});

	const db = app.firestore();
	if (data) await seedMockData(db, data);

	await loadRules(projectId);

	return db;
};

//clean up Firebase app helper
export const cleanup = async () => {
	await Promise.all(firebase.apps().map(app => app.delete()));
};

//////////////////////////////////////////////// custom matcher
expect.extend({
	async toAllow(promise) {
		let pass;
		try {
			await firebase.assertSucceeds(promise);
			pass = true;
		} catch (e) {
			pass = false;
		}
		return {
			pass,
			message: () =>
				'Expected Firebase operation to be allowed, but it failed.'
		};
	},
	async toDeny(promise) {
		let pass;
		try {
			await firebase.assertFails(promise);
			pass = true;
		} catch (e) {
			pass = false;
		}
		return {
			pass,
			message: () =>
				'Expected Firebase operation to be denied, but it was allowed.'
		};
	}
});
