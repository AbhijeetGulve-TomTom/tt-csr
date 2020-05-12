import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
  map = null;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.map = tt.map({
      key: 'b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V',
      container: 'map',
      style: 'tomtom://vector/1/basic-main',
      center: [73.778647, 18.6077501],
      zoom: 12,
    });
    this.map.addControl(new tt.NavigationControl());
    this.map.addControl(
      new tt.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    // this.getKitchenDetails();
    this.getSheetData().subscribe((resp) => {
      // console.log(resp);
      const features = [];
      resp.forEach((element) => {
        console.log(element);
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [element.longitude, element.latitude],
          },
          properties: {
            address: element.address,
            served: element.dishesservtillnow

          },
        };
        features.push(feature);
      });
      const featureCollection = {
        type: 'FeatureCollection',
        features: features,
      };
      const layerName = 'kitchen';
      // if (this.map.getSource(layerName)) {
      //   this.map.getSource(layerName).setData(featureCollection);
      // } else {
      //   this.map.addSource(layerName, featureCollection);
      // }
      console.log(JSON.stringify(featureCollection));
      const that = this;
      this.map.on('load', function () {
        that.map.addSource(layerName, {
          type: 'geojson',
          data: featureCollection,
        });
        that.map.addLayer({
          id: layerName,
          type: 'circle',
          source: layerName,
          paint: {
            'circle-radius': 10,
            'circle-color': '#FF0000',
          },
        });
        that.map.moveLayer(layerName);
      });
    });

    const popup = new tt.Popup().addTo(this.map);
    const that = this;
    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on('mouseenter', 'kitchen', function (e) {
      console.log(e);
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      let html = '';
      Object.keys(properties).forEach(function(key) {
        var value = properties[key];
        html += '<tr><td>' + key + '</td>' + '<td>' + value + '</td></tr>';
    });

      popup.setLngLat(coordinates).setHTML(html).addTo(that.map);
    });
  }

  public getSheetData(): Observable<any> {
    const sheetId = '15Kndr-OcyCUAkBUcq6X3BMqKa_y2fMAXfPFLiSACiys';
    // const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;
    const url =
      'https://spreadsheets.google.com/feeds/list/1dlbj_KA5847UGjqHxCwZ3uDGNYo2sirros7sBaBcttM/od6/public/values?alt=json';

    return this.http.get(url).pipe(
      map((res: any) => {
        const data = res.feed.entry;

        const returnArray: Array<any> = [];
        if (data && data.length > 0) {
          data.forEach((entry) => {
            const obj = {};
            for (const x in entry) {
              if (x.includes('gsx$') && entry[x].$t) {
                obj[x.split('$')[1]] = entry[x]['$t'];
              }
            }
            returnArray.push(obj);
          });
        }
        return returnArray;
      })
    );
  }
}
