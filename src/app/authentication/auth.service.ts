import {Injectable} from '@angular/core';
import {Auth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import {doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {User} from '../models/user';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore, private router: Router, private alertController: AlertController) {
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  login({email, password}) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((user) => {
        this.createUser().then(() => {
          this.router.navigateByUrl('/home').then(() => console.log('navigated to home'));
        });
      })
      .catch(async (e) => {
        console.error('login failed', e);
        await this.showAlert('Login failed', 'Please try again!');
      });
  }

  logout() {
    return signOut(this.auth);
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  createUser(): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      const userData = await this.getUserData();
      if (userData == null) {
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

        console.log('user does not exist', data);
        setDoc(userDocRef, data)
          .then(r => {
            console.log('user data updated', r);
            resolve(data);
          })
          .catch(err => {
            console.error('error setting docs', err);
            reject(err);
          });
      } else {
        console.log('user data', userData);
        resolve(userData);
      }
    });
  }

  getUserData$(): Observable<User> {
    const user = this.getCurrentUser();
    if (user) {
      console.log('user exists', user);
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return docData(userDocRef, {idField: 'id'}) as Observable<User>;
    }
    return of(null);
  }

  getUserData(): Promise<User> {
    return this.getUserData$().toPromise();
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
