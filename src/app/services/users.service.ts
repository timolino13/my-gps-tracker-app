import {Injectable} from '@angular/core';
import {UserDocument} from '../models/user-document';
import {doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
import {Observable, of} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {Auth} from '@angular/fire/auth';
import {User} from 'firebase/auth';
import {DocumentData, DocumentReference} from '@angular/fire/compat/firestore';

@Injectable({
	providedIn: 'root'
})
export class UsersService {

	constructor(private readonly auth: Auth, private readonly firestore: Firestore) {
	}

	createUserData(user: User): Promise<UserDocument> {
		return new Promise<UserDocument>(async (resolve, reject) => {
			console.log('userData is null');
			console.log('current user', user);
			const userDocRef = doc(this.firestore, `users/${user.uid}`);

			const data: UserDocument = {
				id: user.uid,
				email: user.email,
				roles: {
					admin: false
				},
				verified: false,
			};

			setDoc(userDocRef, data)
				.then(r => {
					console.log('user data created', r);
					resolve(data);
				})
				.catch(err => {
					console.error('error creating user data', err);
					reject(err);
				});
		});
	}

	getUserDataByUserId$(userId: string): Observable<UserDocument> {
		if (userId) {
			console.log('getting user data', userId);
			const userDocRef = doc(this.firestore, `users/${userId}`);
			return docData(userDocRef, {idField: 'id'}) as Observable<UserDocument>;
		}
		return of(null);
	}

	getUserDataByUserId(userId: string): Promise<UserDocument> {
		return this.getUserDataByUserId$(userId)
			.pipe(
				take(1),
				tap((userData: UserDocument) => userData)
			).toPromise();
	}

	getUserDataByUserRef$(userRef): Observable<UserDocument> {
		if (userRef) {
			console.log('getting user data', userRef);
			return docData(userRef, {idField: 'id'}) as Observable<UserDocument>;
		}
		return of(null);
	}

	getUserDataByUserRef(userRef): Promise<UserDocument> {
		return this.getUserDataByUserRef$(userRef).pipe(
			take(1),
			tap((userData: UserDocument) => userData)
		).toPromise();
	}


}
