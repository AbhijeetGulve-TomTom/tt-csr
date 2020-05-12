import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

  map = null;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.map = tt.map({
      key: 'b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V',
      container: 'map',
      style: 'tomtom://vector/1/basic-main'
    });
    this.map.addControl(new tt.NavigationControl());
    this.map.addControl(new tt.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
      },
      trackUserLocation: true
    }));
  }

  public getKitchenDetails(){
    const url = 'https://docs.google.com/spreadsheets/d/1rjxzB6Fkwu7Irz8uyXgS4OrqVMwNkdilXpxMGIjmOEo/edit?usp=sharing';
  }
}
