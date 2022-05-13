import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  credentials: FormGroup;

  constructor(private formBuilder: FormBuilder, private loadingController: LoadingController, private alertController: AlertController,
              private authService: AuthService, private router: Router) {
  }

  get email() {
    return this.credentials.get('email');
  }

  ngOnInit() {
    this.credentials = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  resetPassword() {
    this.authService.resetPassword(this.credentials.value.email).then(() => {
      this.showAlert('Password reset', 'Check your email for a reset link').then(r => {
        this.router.navigate(['/login']).then(() => {
          console.log('navigated to login');
        });
      });
    }).catch(error => {
      console.error('password reset error', error);
      this.showAlert('Password reset failed', 'PLease try again later');
    });
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
