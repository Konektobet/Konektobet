import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, Subject  } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

export interface User{
  id?: string
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
}

export interface ClinicUser{
  id?: string
  fname: string
  lname: string
  email: string
  num: string
}

export interface Clinic {
  matchCount: any;
  cService: string;
  cSchedule: string;
  cHealthcare: string;
  similarity?: number;
  rank?: number;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private apiUrl = 'http://127.0.0.1:5000/';

  private supabase: SupabaseClient;
  private authStateSubject: BehaviorSubject<Session | null> = new BehaviorSubject<Session | null>(null);

  constructor(
    private http: HttpClient,
  ) {
    this.supabase = createClient('https://vnhnpwrekixhemmtyeea.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaG5wd3Jla2l4aGVtbXR5ZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA0OTA4NzcsImV4cCI6MjAxNjA2Njg3N30.qWWTJvHbQiZY86F7cJ1qrBxIIFinBZt_SZ1gu-wInAk');
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.authStateSubject.next(session);
    });
  }
  isUserLoggedIn(): boolean {
    const session = this.authStateSubject.getValue();
    return !!session;
  }
  
  // for recommendation.py
  findClinic(userPreferences: any) {
    const apiUrl = `${this.apiUrl}/api/recommendations`;  // Correct endpoint path
    return this.http.post(apiUrl, userPreferences);
  }
  
  user(user: User){
    return this.supabase.from('users_tbl')
    .select(`firstname, lastname, email, phoneNumber`)
    .eq('id', user.id)
    .single()
  }

  clinicUser(clinicUser: ClinicUser){
    return this.supabase.from('clinic_users_tbl')
    .select(`fname, lname, email, num`)
    .eq('id', clinicUser.id)
    .single()
  }

  getSupabase(): SupabaseClient {
    return this.supabase;
  }

  getAuthState(): Observable<Session | null> {
    return this.authStateSubject.asObservable();
  }

  getAuthStateSnapshot(): User | null {
    const session = this.authStateSubject.getValue();
    return session
      ? {
        id: session.user.id || '',
        firstname: session.user.user_metadata?.['firstname'] || '',
        lastname: session.user.user_metadata?.['lastname'] || '',
        email: session.user.email || '',
        phoneNumber: session.user.user_metadata?.['phoneNumber'] || '',
      }
      : null;
  }

  getClinicAuthStateSnapshot(): ClinicUser | null {
    const session = this.authStateSubject.getValue();
    return session
      ? {
        id: session.user.id || '',
        fname: session.user.user_metadata?.['fname'] || '',
        lname: session.user.user_metadata?.['lname'] || '',
        email: session.user.email || '',
        num: session.user.user_metadata?.['num'] || '',
      }
      : null;
  }

  async saveMatchedClinics(matchedClinics: Clinic[]): Promise<void> {
    try {
      const { data: insertData, error: insertError } = await this.supabase
        .from('matched_clinics_tbl') 
        .insert(matchedClinics);

      if (insertError) {
        console.error('Error inserting matched clinics:', insertError);
      } else {
        console.log('Matched clinics added successfully:', insertData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
