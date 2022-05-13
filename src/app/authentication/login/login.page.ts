import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {LoadingController, ViewWillEnter} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, ViewWillEnter {
	credentials: FormGroup;

	constructor(private readonly formBuilder: FormBuilder, private readonly authService: AuthService,
	            private readonly loadingController: LoadingController, private readonly router: Router) {
	}

	get email() {
		return this.credentials.get('email');
	}

	get password() {
		return this.credentials.get('password');
	}

	ngOnInit() {
		this.init();
	}

	ionViewWillEnter() {
		this.credentials.reset();
	}

	init() {
		this.credentials = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required]],
		});
	}

	async login() {
		const loading = await this.loadingController.create({
			message: 'Please wait...'
		});
		await loading.present();

		this.authService.login(this.credentials.value)
			.then((userCredentials) => {
				console.log('logged', userCredentials);
			})
			.catch((error) => {
				console.log('error', error);
			});
		await loading.dismiss();
	}

	async register() {
		await this.router.navigate(['/register']);
	}

	async forgotPassword() {
		await this.router.navigate(['/reset-password']);
	}
}
