import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginDialogService {
  private hasLoggedInBeforeKey = 'hasLoggedInBefore';
  private loginSuccessSubject = new BehaviorSubject<boolean>(false);

  hasLoggedInBefore(): boolean {
    return localStorage.getItem(this.hasLoggedInBeforeKey) === 'true';
  }

  markAsLoggedIn(): void {
    localStorage.setItem(this.hasLoggedInBeforeKey, 'true');
  }

  login(): Promise<boolean> {
    // Simulate a login process (replace with your actual login logic)
    return new Promise<boolean>((resolve) => {
      // Assume login is successful
      this.markAsLoggedIn();
      this.loginSuccessSubject.next(true);
      resolve(true);
    });
  }

  getLoginSuccessObservable(): Observable<boolean> {
    return this.loginSuccessSubject.asObservable();
  }

  constructor() {}
}
