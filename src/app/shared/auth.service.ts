import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { firebase } from 'firebase/compat/app';
import { Router } from '@angular/router';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private ngFireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
  ) {}

  async signInWithGoogle(){
    return await this.ngFireAuth.signInWithPopup(new GoogleAuthProvider());
  }

  async signInWithFacebook(){
    return await this.ngFireAuth.signInWithPopup(new FacebookAuthProvider());
  }

  async loginUser(user: {email: string, password: string}){
    return await this.ngFireAuth.signInWithEmailAndPassword(user.email, user.password);
  }

  async registerUser(firstname: string, lastname: string, phoneNumber: string, email: string, password: string, confirmPassword: string): Promise<any> {
    try {
      const userCredential = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        // If user registration is successful, add user data to Firestore
        const userData = {
          firstname: firstname,
          lastname: lastname,
          phoneNumber: phoneNumber,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        };
        await this.firestore.collection('users_tbl').add(userData); // Add user data to Firestore 'users' collection
      }
      return userCredential;
    } catch (error) {
      throw error;
    }
  }
}
