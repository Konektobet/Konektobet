import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.scss']
})
export class FindComponent implements OnInit {

  serviceControl = new FormControl('');
  scheduleControl = new FormControl('');
  healthcareControl = new FormControl('');

  isDropdownActive = false;

  services: string[] = ['Grooming', 'General Checkups', 'Vaccinations', 'Surgery', 'Emergency Care', 'X-ray and Imaging', 'Lab Tests', 'Preventive Medicine'];
  filteredServices!: Observable<string[]>;
  selectedServices: string[] = [];

  schedules: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  filteredSchedules!: Observable<string[]>;
  selectedSchedules: string[] = [];

  healthcares: string[] = ['Parvo Cases', 'Vaccinations', 'Dental Care'];
  filteredHealthcares!: Observable<string[]>;
  selectedHealthcares: string[] = [];

  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
  ){}

  ngOnInit() {
    this.filteredServices = this.serviceControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterService(value || ''))
    );

    this.filteredSchedules = this.scheduleControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterSchedule(value || ''))
    );

    this.filteredHealthcares = this.healthcareControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterHealthcare(value || ''))
    );

    this.filteredServices.subscribe(() => {
      this.resetControl(this.serviceControl);
    });

    this.filteredSchedules.subscribe(() => {
      this.resetControl(this.scheduleControl);
    });

    this.filteredHealthcares.subscribe(() => {
      this.resetControl(this.healthcareControl);
    });


    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this.formBuilder.group({
      thirdCtrl: ['', Validators.required]
    })
  }

  onSelectServices(service: string): void {
    if (!this.selectedServices.includes(service)) {
      this.selectedServices.push(service);
    }

    this.resetControl(this.serviceControl);
  }

  removeServices(index: number): void {
    this.selectedServices.splice(index, 1);
  }


  onSelectSchedules(schedule: string): void {
    if (!this.selectedSchedules.includes(schedule)){
      this.selectedSchedules.push(schedule);
    }

    this.resetControl(this.scheduleControl);
  }

  removeSchedules(index: number): void {
    this.selectedSchedules.splice(index, 1);
  }


  onSelectHealthcares(healthcare: string): void {
    if (!this.selectedHealthcares.includes(healthcare)){
      this.selectedHealthcares.push(healthcare);
    }

    this.resetControl(this.healthcareControl);
  }

  removeHealthcares(index: number): void {
    this.selectedHealthcares.splice(index, 1);
  }


  toggleDropdown(): void {
    this.isDropdownActive = !this.isDropdownActive;
  }

  private filterService(value: string): string[] {
    const filterValueService = this.normalizeValue(value);
    return this.services.filter(service => this.normalizeValue(service).includes(filterValueService));
  }

  private filterSchedule(value: string): string[] {
    const filterValueSchedule = this.normalizeValue(value);
    return this.schedules.filter(schedule => this.normalizeValue(schedule).includes(filterValueSchedule));
  }

  private filterHealthcare(value: string): string[] {
    const filterValueHealthcare = this.normalizeValue(value);
    return this.healthcares.filter(healthcare => this.normalizeValue(healthcare).includes(filterValueHealthcare));
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  private resetControl(control: FormControl): void {
    if (control.value !== '') {
      control.reset('');
    }
  }

  navigateToFoundClinics(){
    this.router.navigate(['/found-clinc']);
  }
  areServicesSelected(): boolean {
    // Customize this logic based on your requirements
    return this.selectedServices.length > 0;
  }
}