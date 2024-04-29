import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userFirstname: string = '';
  private userLastname: string = '';

  constructor(private supabaseService: SupabaseService) {}

  async loadUserData() {
    const user = this.supabaseService.getAuthStateSnapshot();
    if (user) {
      const fullNameData = await this.getFullname(user.email);
      if (fullNameData.length > 0) {
        this.userFirstname = fullNameData[0].firstname;
        this.userLastname = fullNameData[0].lastname;
      }
    }
  }

  async loadClinicUserData() {
    const user = this.supabaseService.getClinicAuthStateSnapshot();
    if (user) {
      const fullNameData = await this.getClinicFullname(user.email);
      if (fullNameData.length > 0) {
        this.userFirstname = fullNameData[0].fname;
        this.userLastname = fullNameData[0].lname;
      }
    }
  }

  async getFullname(email: string): Promise<any> {
    const response = await this.supabaseService
      .getSupabase()
      .from('users_tbl')
      .select('firstname, lastname')
      .eq('email', email);
  
    return response.data || [];
  }

  getUserFirstname(): string {
    return this.userFirstname;
  }

  getUserLastname(): string {
    return this.userLastname;
  }

  // ClinicLoginComponent
  async getClinicFullname(email: string): Promise<any> {
    const response = await this.supabaseService
      .getSupabase()
      .from('clinic_users_tbl')
      .select('fname, lname')
      .eq('email', email);

    return response.data || [];
  }

  getClinicUserFirstname(): string {
    return this.userFirstname;
  }

  getClinicUserLastname(): string {
    return this.userLastname;
  }
}