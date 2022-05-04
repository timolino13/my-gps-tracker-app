import {Injectable} from '@angular/core';
import {Auth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import {doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {User} from '../models/user';
import {Observable, of} from 'rxjs';
import {take, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore, private router: Router, private alertController: AlertController) {
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async login({email, password}): Promise<any> {

    const credentials = await signInWithEmailAndPassword(this.auth, email, password)
      .catch(async (e) => {
        console.error('login failed', e);
        await this.showAlert('Login failed', 'Please try again!');
      });

    const data = await this.getUserData().catch(async (e) => {
      return await this.createUserData();
    });

    console.log('User data: ', data);

    if (data) {
      console.log('User logged in: ', credentials);

      await this.router.navigateByUrl('/reservations');
    }

    return credentials;
  }

  async logout() {
    await signOut(this.auth);
    await this.router.navigateByUrl('/login');
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  createUserData(): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      console.log('userData is null');
      const user = this.getCurrentUser();
      console.log('current user', user);
      const userDocRef = doc(this.firestore, `users/${user.uid}`);

      const data: User = {
        id: user.uid,
        email: user.email,
        roles: {
          admin: false
        }
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
    const user = this.getCurrentUser();

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

  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
