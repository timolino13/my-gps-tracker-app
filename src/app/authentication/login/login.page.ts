import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {LoadingController} from '@ionic/angular';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	credentials: FormGroup;

	constructor(private readonly formBuilder: FormBuilder, private readonly authService: AuthService,
	            private readonly loadingController: LoadingController) {
	}

	get email() {
		return this.credentials.get('email');
	}

	get password() {
		return this.credentials.get('password');
	}

	ngOnInit() {
		this.credentials = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
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
}
