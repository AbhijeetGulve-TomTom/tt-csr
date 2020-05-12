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
          id: 'population',
          type: 'circle',
          source: layerName,
          paint: {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': 10,
            // color circles by ethnicity, using a match expression
            // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            'circle-color': '#FF0000',
          },
        });
      });
    });

    this.map.on('click', 'kitchen', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new tt.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(this.map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mouseenter', 'kitchen', function() {
      this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'kitchen', function() {
      this.map.getCanvas().style.cursor = '';
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
