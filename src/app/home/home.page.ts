import { Component } from '@angular/core';
import * as L from 'leaflet';

// Atur jalur ikon secara manual agar Leaflet bisa menemukan ikon marker
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';
const defaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  map!: L.Map;

  // Layer untuk peta dasar
  osmLayer!: L.TileLayer;
  satelliteLayer!: L.TileLayer;
  darkLayer!: L.TileLayer;
  positronLayer!: L.TileLayer;

  constructor() { }

  ngOnInit() { }

  ionViewDidEnter() {
    // Buat peta dengan posisi awal
    this.map = L.map('mapId').setView([-7.379409, 112.6428918], 10);

    // Layer OpenStreetMap (OSM)
    this.osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map); // Tambahkan layer ini sebagai default

    // Layer Satellite dari Esri
    this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Layer Dark Mode
    this.darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">Carto</a>'
    });

    // Layer CartoDB Positron
    this.positronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">Carto</a>'
    });

    // Menambahkan marker pada lokasi yang ditentukan
    const marker = L.marker([-7.3072363,112.7051286]).addTo(this.map);
    const popupContent = `
      <div>
        <strong>Kebun Binatang Surabaya</strong><br>
        <img src="https://panduanwisata.b-cdn.net/wp-content/uploads/2022/12/Kebun-Binatang-Surabaya.jpg" alt="Kebun Binatang Surabaya" style="width: 150px; height: auto;">
      </div>`;
    marker.bindPopup(popupContent).openPopup();

    // Layer control untuk basemap
    const baseMaps = {
      "OpenStreetMap": this.osmLayer,
      "Satellite": this.satelliteLayer,
      "Dark Mode": this.darkLayer,
      "CartoDB Positron": this.positronLayer
    };

    // Tambahkan kontrol layer untuk mengganti basemap
    L.control.layers(baseMaps).addTo(this.map);
  }
}
