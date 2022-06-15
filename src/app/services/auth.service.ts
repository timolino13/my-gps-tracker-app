import {Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import {Firestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {UsersService} from './users.service';
import {Observable, of} from 'rxjs';
import {User} from 'firebase/auth';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	private currentUser: User;

	constructor(private readonly auth: Auth, private readonly firestore: Firestore, private readonly router: Router,
	            private readonly alertController: AlertController, private readonly usersService: UsersService) {
		this.observeUser();
	}

	async register(value: { email: string; password: string; confirmPassword: string }) {
		await createUserWithEmailAndPassword(this.auth, value.email, value.password).then(async () => {
			await this.usersService.createUserData(this.getCurrentUser());
			await this.logout();
			await this.showAlert('Register successful', 'Please ask an administrator to verify your account!');
			await this.router.navigateByUrl('/login');
		}).catch((e: Error) => {
			console.error('register failed', e);
			this.showAlert('Register failed', this.formatErrorMessage(e.message));
			return;
		});

	}

	async login({email, password}): Promise<any> {

		signInWithEmailAndPassword(this.auth, email, password).then(async (credentials) => {
			const data = await this.usersService.getUserDataByUserId(this.getCurrentUser().uid)
				.catch(async (e) => await this.usersService.createUserData(this.getCurrentUser()));

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
		}).catch(async (e) => {
			console.error('login failed', e);
			await this.showAlert('Login failed', this.formatErrorMessage(e.message));
			return;
		});
	}

	async logout() {
		await signOut(this.auth);
		await this.router.navigateByUrl('/login');
	}

	async resetPassword(email: string) {
		return sendPasswordResetEmail(this.auth, email);
	}

	getCurrentUser(): User {
		return this.currentUser;
	}

	getCurrentUser$(): Observable<User> {
		console.log(this.currentUser);
		return of(this.currentUser);
	}

	private observeUser() {
		onAuthStateChanged(this.auth, (user) => {
			if (user) {
				this.currentUser = user;
			} else {
				this.currentUser = null;
			}
		});
	}

	private async showAlert(header, message) {
		const alert = await this.alertController.create({
			header,
			message,
			buttons: ['OK'],
		});
		await alert.present();
	}

	private formatErrorMessage(message: string): string {
		let errorMessage = message.split('/')[1];
		errorMessage = errorMessage.split(')')[0];
		errorMessage = errorMessage.replaceAll('-', ' ');
		errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
		return errorMessage;
	}
}
