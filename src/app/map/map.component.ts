import{Component, OnInit, ViewEncapsulation}from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import {HttpClient}from '@angular/common/http';
import {map}from 'rxjs/operators';
import {Observable, Subject}from 'rxjs';
@Component({
selector: 'app-map',
templateUrl: './map.component.html',
styleUrls: ['./map.component.css'],
encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
map = null;
columns = [
'no.ofpeoplerequirefoodacceptmorethan10only', 'foodrequirementisfor',
'pickuplocationforgroceries', 'status', 'kitchenname'
];
dataLoaded = new Subject<boolean>();

featureCollectionForPickup: {type: string; features: any[];
};
featureCollectionForFoodNeeded: { type: string; features: any[];
};
featureCollection: {type: string; features: any[];
};
featureRequestCollection: {type: string; features: any[];
};

constructor(private http: HttpClient) {}

  ngOnInit() {
    this.map = tt.map({
      key: 'b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V',
      container: 'map',
      style: 'tomtom://vector/1/basic-main',
      center: [73.778647, 18.6077501],
      zoom: 10,
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

      this.onMapLoad();

    const popup = new tt.Popup();

    const that = this;
    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on('mouseenter', 'K3', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'K3', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });

    this.map.on('mouseenter', 'K1', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'K1', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });

    this.map.on('mouseenter', 'K2', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'K2', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });

    this.map.on('mouseenter', 'request', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
    this.map.on('click', 'request', function (e) {
      console.log(e);
      that.createPopup(e, popup, that);
    });
  }

  private populateFeatures(featuresPickup: any[], featuresFoodNeeded: any[], features: any[], requestFeatures: any[]) {
    this.featureCollectionForPickup = {
      type: 'FeatureCollection',
      features: featuresPickup,
    };
    this.featureCollectionForFoodNeeded = {
      type: 'FeatureCollection',
      features: featuresFoodNeeded,
    };
    this.featureCollection = {
      type: 'FeatureCollection',
      features: features,
    };
    this.featureRequestCollection = {
      type: 'FeatureCollection',
      features: requestFeatures,
    };
  }

  private processSheetDataResponse(resp: any, that: this, featuresPickup: any[], featuresFoodNeeded: any[], features: any[], requestFeatures: any[]) {
   const arr=[]
    resp.forEach((element) => {
      const props = {};
      const date = new Date().getDate();
      const recordDate = new Date(Date.parse(element.timestamp)).getDate();
      if (typeof element.longitude !== 'undefined') {
     //   props['latlong']=element.longitude +''+ element.latitude;
        Object.keys(element).forEach(function (key) {
          if (that.columns.includes(key)) {
            const value = element[key];
            props[key] = value;
          }
        });

       //console.log(props)
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [element.longitude, element.latitude],
          },
          properties: props,
        };
        arr.push(feature)
        if (element.kitchenname === 'K1') {
          featuresPickup.push(feature);
        }
        else if ((element.kitchenname === 'K2')) {
          featuresFoodNeeded.push(feature);
        }
        else if ((element.kitchenname === 'K3')) {
          features.push(feature);
        }
        else {
          requestFeatures.push(feature);
        }
      }
    });

//TODO

const finaldict={}
const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

console.log(arr)
//console.log(groupBy(arr, latlong))

  }

  onMapLoad() {
        this.map.on('style.load', () => {
          this.loadImages();

          this.dataLoaded.subscribe(dataLoad => {
            this.plotLayer(this, 'K3', this.featureCollection);
            this.plotLayer(this, 'K1', this.featureCollectionForPickup);
            this.plotLayer(this, 'K2', this.featureCollectionForFoodNeeded);
            this.plotLayer(this, 'request', this.featureRequestCollection);
          });

          this.getSheetData().subscribe((resp) => {
            console.log("sheet data response:");
            const that = this;
            const requestFeatures = [];
            const features = [];
            const featuresPickup = [];
            const featuresFoodNeeded = [];

            this.processSheetDataResponse(resp, that, featuresPickup, featuresFoodNeeded, features, requestFeatures);
            this.populateFeatures(featuresPickup, featuresFoodNeeded, features, requestFeatures);

            this.dataLoaded.next(true);
          });
        });
  }

  private plotLayer(that: this, layerName: string, featureCollection: { type: string; features: any[]; }) {
    that.map.addSource(layerName, {
      type: 'geojson',
      data: featureCollection,
    });
    that.map.addLayer({
      id: layerName,
      type: 'symbol',
      source: layerName,
      // paint: {
      // 'circle-radius': 10,
      // 'circle-color': color,
      // },
      'layout' : {
      'icon-image' : layerName,
      "icon-size": {
                "base": 0.1,
                "stops": [
                    [
                      16,
                      0.05
                      ],
                      [
                      20,
                      0.08
                      ]
                ]
      },
      "icon-allow-overlap": true
      }
      });
  }

  private loadImages() {
 const speedCamImgArray = ['K1', 'K2', 'K3', 'K4', 'request'];
 // tslint:disable-next-line: no-shadowed-variable
 const map = this.map;
 speedCamImgArray.forEach(speedCamImage => {
 map.loadImage('assets/' + speedCamImage + '_new.png', (error, image) => {
 if (error) {
 throw error;
 }
 map.addImage(speedCamImage, image);
 });
 });
}
  private createPopup(e: any, popup: any, that: this) {

    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;
    let html = '<table style="border:fill">';
    Object.keys(properties).forEach(function (key) {
      const value = properties[key];
      html += '<tr><td>' + key + ': </td>' + '<td>' + value + '</td></tr>';
    });
    html += '</table>';

    popup.setLngLat(coordinates);
    popup.setHTML(html);
    popup.setMaxWidth('none');
    popup.addTo(that.map);

    // create DOM element for the marker
    /* const el = document.createElement('div');
    el.id = 'marker';
    // create the marker
    new tt.Marker(el)
    .setLngLat(coordinates)
    .setPopup(popup) // sets a popup on this marker
    .addTo(that.map); */
  }

  public getSheetData(): Observable<any> {
    const sheetId = '1Q6-7HysapeBawWJqHDyRCMDr0ZoX9nhlHvuldJ3fSiQ';
    const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/2/public/values?alt=json`;
    // const url =
      // 'https://spreadsheets.google.com/feeds/list/1Q6-7HysapeBawWJqHDyRCMDr0ZoX9nhlHvuldJ3fSiQ/1/public/values?alt=json';

      // const url = '../../assets/values.json';
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
