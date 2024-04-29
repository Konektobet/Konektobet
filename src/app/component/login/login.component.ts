import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from 'src/app/shared/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
// import * as firebaseui from 'firebaseui';
// import { UserCredential } from '@firebase/auth-types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  passwordControl: FormControl = new FormControl('', Validators.required);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  })
  
  // Password eye
  hide: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
  ){}

  togglePasswordVisibility(){
    this.hide = !this.hide;
  }

  redirectToSignup(){
    this.router.navigate(['/signup']);
  }

  loginWithGoogle(){
    this.authService.signInWithGoogle().then((res:any) =>{
      this.router.navigate(['/home']);
    }).catch((error:any) => {
      console.error(error);
    });
  }

  loginWithFacebook(){
    this.authService.signInWithFacebook().then((res:any) => {
      this.router.navigate(['/home']);
    }).catch((error: any) => {
      console.error(error);
    })
  }

  login() {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;
      this.authService.loginUser(userData).then((res: any) => {
        this.router.navigate(['/home']);
        console.log('Login success');
      }).catch((error: any) => {
        console.error(error);
        // Handle login error, e.g., show error message to the user
      });
    }
  }
}
