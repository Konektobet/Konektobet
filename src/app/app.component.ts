import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Konektobet';

  showClinicMenubar: boolean = false;
  showAdminMenubar: boolean = false;
  showUserMenubar: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check the current route to determine when to show clinic and admin menu bars
        this.showClinicMenubar = event.url.includes('/clinic/');
        this.showAdminMenubar = event.url.includes('/admin/');
        this.showUserMenubar = !this.showClinicMenubar && !this.showAdminMenubar;
      }
    });
  }

  @Output() sidenavToggle = new EventEmitter<void>();
}