import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

  map = null;
  constructor() { }

  ngOnInit() {
    this.map = tt.map({
      key: 'b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V',
      container: 'map',
      style: 'tomtom://vector/1/basic-main'
      // dragPan: !tt.isMobileOrTablet()
    });
    this.map.addControl(new tt.FullscreenControl());
    this.map.addControl(new tt.NavigationControl());
    this.addSearchBox(this.map);
  }

  private addSearchBox(map: any) {
    const searchBoxInstance =  tt.searchBox({
      position: 'topleft',
      language: 'en-GB',
      serviceOptions: { unwrapBbox: true },
      collapsed: true,
      view: 'IN'
    }).addTo(map);

    // Marker layer to display the results over the map
    var markersLayer = tt.tomTomMarkersLayer().addTo(map);

    // Draw markers for all the results found by the searchBox control (before user selects one)
    searchBoxInstance.on(searchBoxInstance.Events.ResultsFound, function(results) {
        markersLayer.setMarkersData(results.data)
            .addMarkers();
    });

    // Draw markers for all the results found by the searchBox control (before user selects one)
    searchBoxInstance.on(searchBoxInstance.Events.ResultsCleared, function() {
      markersLayer.clearLayers();
    });

    // Add a marker to indicate the position of the result selected by the user
    searchBoxInstance.on(searchBoxInstance.Events.ResultClicked, function(result) {
      markersLayer.setMarkersData([result.data])
          .addMarkers();

      var viewport = result.data.viewport;
      if (viewport) {
          map.fitBounds([viewport.topLeftPoint, viewport.btmRightPoint]);
      } else {
          map.fitBounds(markersLayer.getBounds());
      }
    });
  }

}
