import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() { }

  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable((subscriber) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            subscriber.next(position);
            subscriber.complete(); // Complete the observable
          },
          (error) => {
            subscriber.error(error);
          }
        );
      } else {
        subscriber.error(new Error('Geolocation is not supported by this browser'));
      }
    });
  }
  // getLocationService(): Promise<any>{
  //   return new Promise((resolve, reject)=>{
  //     navigator.geolocation.getCurrentPosition(resp=>{
  //       resolve({lng: resp.coords.longitude, lat: resp.coords.latitude})
  //     })
  //   })
  // }
}