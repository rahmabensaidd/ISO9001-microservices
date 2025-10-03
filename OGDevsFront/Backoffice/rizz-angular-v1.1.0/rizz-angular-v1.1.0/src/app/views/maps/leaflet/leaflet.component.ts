import { Component } from '@angular/core'
import { LeafletModule } from '@asymmetrik/ngx-leaflet'
import * as L from 'leaflet'
import { circle, latLng, marker, polygon, tileLayer } from 'leaflet'

@Component({
    selector: 'app-leaflet',
    imports: [LeafletModule],
    templateUrl: './leaflet.component.html',
    styles: ``
})
export class LeafletComponent {
  map!: L.Map
  private moov: (L.CircleMarker<any> | L.Marker<any>)[] = []
  colors: string[] = ['red', 'green', 'blue', 'purple', 'cyan', 'yellow']
  bounds1 = L.latLngBounds(
    L.latLng(54.559322, -5.767822),
    L.latLng(56.1210604, -3.02124)
  )
  bounds2 = L.latLngBounds(
    L.latLng(56.56023925701561, -2.076416015625),
    L.latLng(57.01158038001565, -0.9777832031250001)
  )
  markerLocation = L.latLng(54.18815548107151, -7.657470703124999)
  rectangle3: L.Rectangle | null = null

  pathPoints: L.LatLngExpression[] = [
    [39.72567292003209, -104.98672485351562],
    [39.717222671644635, -104.96612548828124],
    [39.71405356154611, -104.95513916015625],
    [39.70982785491674, -104.94758605957031],
    [39.70454535762547, -104.93247985839844],
    [39.696092520737224, -104.91874694824217],
    [39.687638648548635, -104.90432739257812],
    [39.67759833072648, -104.89471435546875],
  ]

  polyPoints: L.LatLngExpression[] = [
    [39.70348880963439, -104.98603820800781],
    [39.69926245589766, -104.95582580566406],
    [39.67918374111695, -104.94483947753906],
    [39.663856582926165, -104.95307922363281],
    [39.66279941218785, -104.98672485351562],
    [39.70348880963439, -104.98603820800781],
  ]

  extendedBoundsByRectangles = this.getExtendedBoundsByRectangles()
  extendedBoundsByMarker = this.getExtendedBoundsByMarker()

  ngOnInit(): void {
    // Moov_Canvas
    const osmUrl =
      'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    const osmAttrib =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    const osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib })

    this.map = L.map('Moov_Canvas', { preferCanvas: true })
      .setView([50.5, 30.51], 15)
      .addLayer(osm)

    for (let i = 0; i < 20; i++) {
      const circleOptions: L.CircleMarkerOptions = {
        radius: 10, // Adjust the radius as per your requirement
        color: this.colors[i % this.colors.length],
      }

      const circleMarker = L.circleMarker([50.5, 30.51], circleOptions).addTo(
        this.map
      )
      this.moov.push(circleMarker)
    }

    this.updateMarkers()
  }

  // Quick Start Guide
  markers = {
    layers: [
      tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
        {
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
        }
      ),
    ],
    zoom: 13,
    center: latLng(51.505, -0.09),
  }

  markersLayers = [
    circle([51.508, -0.11], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500,
    }),
    polygon(
      [
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047],
      ],
      { color: '#3388ff', fillColor: '#3388ff' }
    ),
    marker([51.5, -0.09]),
  ]

  // simple leaflet map
  SimpleMarker = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution:
          'Map data &&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
      }),
    ],
    zoom: 13,
    center: latLng(51.505, -0.09),
  }

  // Vector Bounds
  mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }),
      L.polyline(this.pathPoints),
      polygon(this.polyPoints),
    ],
    zoom: 12,
    center: latLng(39.69596043694606, -104.95084762573242),
  }

  // boundExtend
  boundExtend = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }),
      L.rectangle(this.bounds1),
      L.rectangle(this.bounds2),
      marker(this.markerLocation),
    ],
    zoom: 7,
    center: this.bounds1.getCenter(),
  }

  getExtendedBoundsByRectangles(): L.LatLngBounds {
    const bounds = new L.LatLngBounds(
      this.bounds1.getSouthWest(),
      this.bounds1.getNorthEast()
    )
    bounds.extend(this.bounds2)
    return bounds
  }

  getExtendedBoundsByMarker(): L.LatLngBounds {
    const bounds = new L.LatLngBounds(
      this.bounds1.getSouthWest(),
      this.bounds1.getNorthEast()
    )
    bounds.extend(this.markerLocation)
    return bounds
  }

  // simple leaflet map
  arrayMap = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 1,
        maxZoom: 17,
      }),

      L.polygon(
        [
          [0, 0],
          [0, 42],
          [42, 42],
          [0, 0],
        ],
        { dashArray: [5, 5] }
      ),
      L.circleMarker([42, 0]),
    ],
    zoom: 3,
    preferCanvas: true,
    center: L.latLng(20, 20),
  }

  private updateMarkers(): void {
    const t = new Date().getTime() / 1000
    this.moov.forEach((marker, i) => {
      const v = t * (1 + i / 10) + ((12.5 * i) / 180) * Math.PI
      marker.setLatLng([
        50.5 + (i % 2 ? 1 : -1) * Math.sin(v) * 0.005,
        30.51 + (i % 3 ? 1 : -1) * Math.cos(v) * 0.005,
      ])
    })

    L.Util.requestAnimFrame(() => this.updateMarkers())
  }
}
