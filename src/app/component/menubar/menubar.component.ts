import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { delay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent implements OnInit {

  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  isMobile: boolean = false;
  isOpen: boolean = false;
  
  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 800px)']).subscribe(result => {
      this.isMobile = result.matches;
      this.updateSidenavMode();
    });
  }

  private updateSidenavMode(): void {
    if (this.isMobile) {
      this.sidenav.close();
      this.sidenav.mode = 'over';
    } else {
      this.sidenav.open();
      this.sidenav.mode = 'side';
    }
  }
}
