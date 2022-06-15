import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {LoadingController, ToastController} from '@ionic/angular';

@Component({
	selector: 'app-registration',
	templateUrl: './registration.page.html',
	styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
	credentials: FormGroup;

	constructor(private readonly formBuilder: FormBuilder, private readonly authService: AuthService,
	            private readonly loadingController: LoadingController, private readonly toastController: ToastController) {
	}

	get email() {
		return this.credentials.get('email');
	}

	get password() {
		return this.credentials.get('password');
	}

	ngOnInit() {
		this.credentials = this.formBuilder.group(
			{
				email: ['', [Validators.required, Validators.email]],
				password: ['', [Validators.required]],
				confirmPassword: ['', [Validators.required]]
			},
			{validators: this.checkPasswords}
		);
	}

	checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
		const pass = group.get('password').value;
		const confirmPass = group.get('confirmPassword').value;
		return pass === confirmPass ? null : {notSame: true};
	};

	async register() {
		const loading = await this.loadingController.create({
			message: 'Creating account...'
		});
		await loading.present();

		await this.authService.register(this.credentials.value).catch(async error => {
			await loading.dismiss();
			console.error(error);
		});

		await loading.dismiss();
	}
	private async presentToast(message: string) {
		const toast = await this.toastController.create({
			message,
			duration: 2000
		});
		await toast.present();
	}
}
