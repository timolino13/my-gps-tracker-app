import {Injectable} from '@angular/core';
import {Auth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import {Firestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {UsersService} from '../services/users.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private readonly auth: Auth, private readonly firestore: Firestore, private readonly router: Router,
              private readonly alertController: AlertController, private readonly usersService: UsersService) {
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

    const data = await this.usersService.getUserData().catch(async (e) => await this.usersService.createUserData());

    console.log('User data: ', data);

    if (data && data.verified) {
      console.log('User logged in: ', credentials);

      await this.router.navigateByUrl('/reservations');

      return credentials;
    } else {
      await this.showAlert('Login failed', 'Please ask your administrator to verify your account!');
      await this.logout();
      return null;
    }
  }

  async logout() {
    await signOut(this.auth);
    await this.router.navigateByUrl('/login');
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
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
