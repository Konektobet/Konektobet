import { Component, OnInit } from '@angular/core';
import { GeolocationService } from 'src/app/service/geolocation.service';

@Component({
  selector: 'app-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['./trial.component.scss']
})
export class TrialComponent implements OnInit {
  latitude!: number;
  longitude!: number;
  errorMessage!: string;

  latitudeDest: number = 14.826920352528232;
  longitudeDest: number = 120.28283939251774;

  constructor(private geolocationService: GeolocationService) {}

  ngOnInit() {
    this.geolocationService.getCurrentPosition().subscribe(
      (position) => {
        console.log('Geolocation success:', position);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.errorMessage = error.message || 'Error fetching geolocation';
      }
    );
    // this.getLocation();
  }

  // getLocation(){
  //   this.geolocationService.getLocationService().then(resp=>{
  //     console.log(resp.lng);
  //     console.log(resp.lat);
  //   })
  // }

  calculateDistance() {
    const earthRadiusKm = 6371;
    const lat1 = this.degreesToRadians(this.latitude);
    const lon1 = this.degreesToRadians(this.longitude);
    const lat2 = this.degreesToRadians(this.latitudeDest);
    const lon2 = this.degreesToRadians(this.longitudeDest);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusKm * c;

    return distance.toFixed(2); // Round to 2 decimal places
  }

  degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180;
  }
}