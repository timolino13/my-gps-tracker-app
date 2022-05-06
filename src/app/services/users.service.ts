import {Injectable} from '@angular/core';
import {User} from '../models/user';
import {doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
import {Observable, of} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {AuthService} from '../authentication/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private readonly authService: AuthService, private readonly firestore: Firestore) {
  }

  createUserData(): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      console.log('userData is null');
      const user = this.authService.getCurrentUser();
      console.log('current user', user);
      const userDocRef = doc(this.firestore, `users/${user.uid}`);

      const data: User = {
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

  getUserData$(): Observable<User> {
    const user = this.authService.getCurrentUser();

    if (user) {
      console.log('getting user data', user);
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return docData(userDocRef, {idField: 'id'}) as Observable<User>;
    }
    return of(null);
  }

  getUserData(): Promise<User> {
    return this.getUserData$()
      .pipe(
        take(1),
        tap((userData: User) => userData)
      ).toPromise();
  }
}
