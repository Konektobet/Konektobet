import { AfterViewInit, Component, ElementRef, Inject, NgZone, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// declare const google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent  {

  // @ViewChild('mapContainer', { static: false })
  // mapContainer!: ElementRef;

  // constructor(
  //   public dialogRef: MatDialogRef<MapsComponent>,
  //   @Inject(MAT_DIALOG_DATA) public data: { url: string },
  //   private zone: NgZone
  // ) {}

  // ngAfterViewInit(): void {
  //   this.loadMap();
  // }

  // initMap(): void {
  //   this.zone.run(() => this.loadMap());
  // }

  // loadMap() {
  //   // Get user's current location using Geolocation API
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const userLocation = {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude
  //         };
  
  //         // Set the map center to the user's location
  //         const map = new google.maps.Map(this.mapContainer.nativeElement, {
  //           center: userLocation,
  //           zoom: 15  // You can adjust the zoom level as needed
  //         });
  
  //         const directionsService = new google.maps.DirectionsService();
  //         const directionsRenderer = new google.maps.DirectionsRenderer({ map });
  
  //         // Replace 'Your destination location' with the address of the clinic
  //         const clinicAddress = '#67 National Hi-way, Brgy. Barretto, Olongapo, Zambales 2200 Olongapo, Philippines'; // Replace with the actual address
  //         const request = {
  //           origin: userLocation, // Set the starting location as the user's coordinates
  //           destination: clinicAddress,
  //           travelMode: google.maps.TravelMode.DRIVING
  //         };
  
  //         directionsService.route(request, (response: any, status: any) => {
  //           if (status === google.maps.DirectionsStatus.OK) {
  //             directionsRenderer.setDirections(response);
  //           } else {
  //             console.error('Error getting directions:', status);
  //           }
  //         });
  //       },
  //       (error) => {
  //         console.error('Error getting user location:', error);
  //       }
  //     );
  //   } else {
  //     console.error('Geolocation is not supported by this browser.');
  //   }
  // }

  // onClose(): void {
  //   this.dialogRef.close();
  // }
}