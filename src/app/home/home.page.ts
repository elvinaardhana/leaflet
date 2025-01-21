import { Component } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

// Atur jalur ikon marker untuk setiap layer
const mitIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@1.0/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bencanaIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@1.0/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const persilIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@1.0/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  map!: L.Map;
  osmLayer!: L.TileLayer;
  satelliteLayer!: L.TileLayer;
  positronLayer!: L.TileLayer;
  geoJsonLayer!: L.GeoJSON;
  markerLayers: { [key: string]: L.LayerGroup } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.map = L.map('mapId').setView([-7.379409, 112.6428918], 10);

    this.osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });

    this.positronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Carto'
    });

    const baseMaps = {
      "OpenStreetMap": this.osmLayer,
      "Satellite": this.satelliteLayer,
      "CartoDB Positron": this.positronLayer
    };
    L.control.layers(baseMaps).addTo(this.map);

    this.loadGeoJSON();
    this.addAPILayerControls();
  }

  loadGeoJSON() {
    fetch('assets/data/adminkec.geojson')
      .then(response => response.json())
      .then(geojsonData => {
        const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'magenta', 'pink', 'cyan', 'brown', 'teal', 'lime', 'lightblue', 'gray', 'maroon', 'gold', 'darkpurple'];        let colorIndex = 0;

        this.geoJsonLayer = L.geoJSON(geojsonData, {
          style: () => {
            const fillColor = colors[colorIndex % colors.length];
            colorIndex++;
            return {
              color: 'black',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.4,
              fillColor: fillColor
            };
          },
          onEachFeature: (feature, layer) => {
            if (feature && feature.properties && feature.properties.name) {
              layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
            }
          }
        }).addTo(this.map);

        this.map.fitBounds(this.geoJsonLayer.getBounds());
      })
      .catch(error => console.error('Error loading GeoJSON:', error));
  }

  loadMarkersFromAPI(apiUrl: string, layerName: string) {
    if (!this.markerLayers[layerName]) {
      this.markerLayers[layerName] = L.layerGroup().addTo(this.map);
    }

    this.http.get<any[]>(apiUrl).subscribe(
      (data) => {
        data.forEach(item => {
          const lat = parseFloat(item.Lintang);
          const lng = parseFloat(item.Bujur);

          if (!isNaN(lat) && !isNaN(lng)) {
            let icon = mitIcon; // Default icon

            // Pilih ikon berdasarkan nama layer
            if (layerName === 'Kegiatan Mitigasi') {
              icon = mitIcon;
            } else if (layerName === 'Kejadian Bencana') {
              icon = bencanaIcon;
            } else if (layerName === 'Persil Bangunan') {
              icon = persilIcon;
            }

            const marker = L.marker([lat, lng], { icon });
            const popupContent = this.getPopupContent(layerName, item);
            marker.bindPopup(popupContent);
            marker.addTo(this.markerLayers[layerName]);
          }
        });
      },
      (error) => {
        console.error(`Error loading markers from API (${apiUrl}):`, error);
      }
    );
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', options);
  }

  getPopupContent(layerName: string, item: any): string {
    switch (layerName) {
      case 'Kegiatan Mitigasi':
        return `
          <strong>Jenis Kegiatan:</strong> ${item['Kegiatan']}<br>
          <strong>Waktu:</strong> ${this.formatDate(item['Time'])}<br>
        `;
      case 'Kejadian Bencana':
        return `
          <strong>Jenis Kejadian:</strong> ${item['Jenis Kejadian']}<br>
          <strong>Waktu Kejadian:</strong> ${this.formatDate(item['Waktu Kejadian'])}<br>
        `;
      case 'Persil Bangunan':
        return `
          <strong>Jenis Bangunan:</strong> ${item['Jenis Bangunan']}<br>
          <strong>Waktu:</strong> ${this.formatDate(item['Time'])}<br>
        `;
      default:
        return '<strong>Data tidak tersedia</strong>';
    }
  }

  addAPILayerControls() {
    const apiData = [
      {
        url: 'https://script.google.com/macros/s/AKfycbzU4aKbZ9HdHT6QqonzSZ08psfeRKyXE2I2Cwrl6D_ECDgzP8NpIIYcpk6v5ua0cFzy/exec',
        name: 'Kegiatan Mitigasi'
      },
      {
        url: 'https://script.google.com/macros/s/AKfycbx4LdIfEsJz_m1wfWDseVfr6XL2K2yi-AJlaOMuX_A6K64lQ4Y0c2ZRshApNc3IuYlSeg/exec',
        name: 'Kejadian Bencana'
      },
      {
        url: 'https://script.google.com/macros/s/AKfycbytDLiAGJBo1mKuAcsWRdM6uD7nkfrOtZ188vUyjbvphQ9ZxT38YqbJ1UqntArk-V0vIA/exec',
        name: 'Persil Bangunan'
      }
    ];

    const CustomControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = `
          <div style="background-color: white; padding: 10px; border-radius: 5px;">
            <strong>Layer API</strong><br>
            <small>Pilih layer API untuk ditampilkan:</small><br>
            ${apiData
              .map(
                (api) => `
              <label style="cursor: pointer; display: block; margin: 5px 0;">
                <input type="checkbox" id="${api.name}" style="margin-right: 5px;" />
                ${api.name}
              </label>`
              )
              .join('')}
          </div>
        `;
        L.DomEvent.disableClickPropagation(div);
        return div;
      }
    });

    const groupControl = new CustomControl();
    this.map.addControl(groupControl);

    apiData.forEach((api) => {
      const checkboxElement = document.getElementById(api.name) as HTMLInputElement;
      checkboxElement?.addEventListener('change', () => {
        if (checkboxElement.checked) {
          this.loadMarkersFromAPI(api.url, api.name);
        } else if (this.markerLayers[api.name]) {
          this.map.removeLayer(this.markerLayers[api.name]);
        }
      });
    });
  }
}
