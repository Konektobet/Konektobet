import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit{
  
  // password eye
  hide: boolean = true;
  confirmHide: boolean = true;
  hideConfirmPassword: boolean = true;
  signupForm: any;
  
  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [
        Validators.required, 
        Validators.email,
        // Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"),
      ]],
      password: ['', [
        Validators.required,
        // Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"),
      ]],
      confirmPassword: ['', [
        Validators.required,
        // Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"),
        ]],
    });
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ){}

  togglePasswordVisibility(){
    this.hide = !this.hide;
  }

  toggleConfirmPasswordVisibility(){
    this.confirmHide = !this.confirmHide;
  }

  redirectToLogin(){
    this.router.navigate(['/login']);
  }

  // signup(){

  //   const userData = Object.assign(this.signupForm.value, {email: this.signupForm.value.username});
  //   // console.log(userData);

  //   this.authService.signInWithEmailAndPassword(userData).then((res: any) => {
  //     this.router.navigate(['/login']);
  //   }).catch((error: any) => {
  //     console.error(error);
  //   });
  //   console.log(this.signupForm.value);
  // }

  get errorCOntrol(){
    return this.signupForm?.controls;
  }

  async signup(){
    if(this.signupForm?.valid){
      // const userData = Object.assign(this.signupForm.value, {email: this.signupForm.value.username});
      const firstname = this.signupForm.value.firstname;
      const lastname = this.signupForm.value.lastname;
      const phoneNumber = this.signupForm.value.phoneNumber;
      const email = this.signupForm.value.email;
      const password = this.signupForm.value.password;
      const confirmPassword = this.signupForm.value.confirmPassword;

      const user = await this.authService.registerUser(firstname, lastname, phoneNumber, email, password, confirmPassword).catch((error) => {
        console.log(error);
      })

      if(user){
        this.router.navigate(['/login']);
        alert("Registration Successful!")
      }
      else{
        console.log('provide correct values');
      }
    }
    console.log(this.signupForm.value);
  }
}
