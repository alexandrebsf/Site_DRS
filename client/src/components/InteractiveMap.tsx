import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDestinationPoint, createLinePoints, calculatePerpendicularPoint, createArcPoints } from '@/lib/ballistics';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  municao?: 'explosiva' | 'nao-explosiva';
  direcaoTiro?: number;
  distanciaX?: number;
  anguloDispersao?: number;
  anguloP?: number;
  distanciaW?: number;
  distanciaA?: number;
  distanciaB?: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

export default function InteractiveMap({
  latitude,
  longitude,
  municao = 'explosiva',
  direcaoTiro = 0,
  distanciaX = 0,
  anguloDispersao = 0,
  anguloP = 0,
  distanciaW = 0,
  distanciaA = 0,
  distanciaB = 0,
  onLocationChange,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const linesRef = useRef<{
    A: L.Polyline | null;
    B: L.Polyline | null;
    C: L.Polyline | null;
    D: L.Polyline | null;
    E: L.Polyline | null;
    F: L.Polyline | null;
    G: L.Polyline | null;
    arc: L.Polyline | null;
    H: L.Polyline | null;
    I: L.Polyline | null;
    J: L.Polyline | null;
    K: L.Polyline | null;
    L: L.Polyline | null;
    M: L.Polyline | null;
    circle: L.Polyline | L.Circle | null;
  }>({
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
    F: null,
    G: null,
    arc: null,
    H: null,
    I: null,
    J: null,
    K: null,
    L: null,
    M: null,
    circle: null,
  });
  const [currentLayer, setCurrentLayer] = useState('osm');

  const layers = [
    { id: 'osm', name: 'Padrão', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { id: 'satellite', name: 'Satélite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { id: 'terrain', name: 'Terreno', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  ];

  const clearAllMarkers = () => {
    if (mapRef.current && markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }
  };

  const drawLine = (
    lineKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M',
    bearing: number,
    color: string,
    dashArray: string,
    label: string,
    startLat: number,
    startLng: number,
    distanceMeters: number
  ) => {
    if (!mapRef.current || distanceMeters <= 0) return;

    // Remove linha anterior se existir
    if (linesRef.current[lineKey]) {
      mapRef.current.removeLayer(linesRef.current[lineKey]!);
    }

    // Calcular ponto final
    const [endLat, endLng] = calculateDestinationPoint(
      startLat,
      startLng,
      bearing,
      distanceMeters
    );

    // Criar pontos intermediários
    const linePoints = createLinePoints(startLat, startLng, endLat, endLng, 50);

    // Desenhar linha
    linesRef.current[lineKey] = L.polyline(linePoints, {
      color: color,
      weight: 4,
      opacity: 0.8,
      dashArray: dashArray,
    }).addTo(mapRef.current);

    // Adicionar marcador no final (ao grupo de marcadores)
    L.circleMarker([endLat, endLng], {
      radius: 5,
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .addTo(markersGroupRef.current!)
      .bindPopup(
        `<div class="text-sm"><p class="font-semibold">Fim da Linha ${label}</p><p>Direcao: ${bearing.toFixed(1)}°</p><p>Distancia: ${distanceMeters.toFixed(1)}m</p></div>`
      );
    
    // Adicionar label com comprimento no meio da linha
   // const labelMidLat = (startLat + endLat) / 2;
    //const labelMidLng = (startLng + endLng) / 2;
    //L.marker([labelMidLat, labelMidLng], {
    //  icon: L.divIcon({
    //    html: `<div style="background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; white-space: nowrap;">${distanceMeters.toFixed(0)}m</div>`,
    //    className: '',
    //    iconSize: [0, 0],
    //    popupAnchor: [0, 0]
      //})
    //})
    //  .addTo(markersGroupRef.current!);
  };

  const drawArc = () => {
    if (!mapRef.current || distanciaX <= 0) return;

    // Remove arco anterior se existir
    if (linesRef.current.arc) {
      mapRef.current.removeLayer(linesRef.current.arc);
    }

    // Bearings das linhas F e G
    const bearingB = direcaoTiro + anguloDispersao;
    const bearingC = direcaoTiro - anguloDispersao;

    // Calcular bearings para o arco usando a fórmula especificada
    // bearingarcF = bearingB + arcsin(W / X) * (180 / PI)
    // bearingarcG = bearingC - arcsin(W / X) * (180 / PI)
    let bearingarcF = bearingB;
    let bearingarcG = bearingC;
    
    if (distanciaX > 0 && distanciaW > 0) {
      const sinValue = distanciaW / distanciaX;
      if (sinValue <= 1) {
        const arcsinValue = Math.asin(sinValue) * (180 / Math.PI);
        bearingarcF = bearingB + arcsinValue;
        bearingarcG = bearingC - arcsinValue;
      }
    }

    // O arco deve ser o complementar: de G até F passando pelo norte
    // Isso significa: de bearingarcG até bearingarcF no sentido anti-horário (passando por 0°)
    const arcPoints = createArcPoints(
      latitude,
      longitude,
      distanciaX,
      bearingarcG,
      bearingarcF,
      150
    );

    // Desenhar arco
    linesRef.current.arc = L.polyline(arcPoints, {
      color: '#0000FF',
      weight: 3,
      opacity: 0.9,
      dashArray: '8, 4',
    }).addTo(mapRef.current);
  };

  const removeLine = (lineKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'arc' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'circle') => {
    if (mapRef.current && linesRef.current[lineKey]) {
      mapRef.current.removeLayer(linesRef.current[lineKey]!);
      linesRef.current[lineKey] = null;
    }
  };

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map('map').setView([latitude, longitude], 13);

      // Add initial tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Create feature group for markers
      markersGroupRef.current = L.featureGroup().addTo(mapRef.current);

      // Add marker
      markerRef.current = L.marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(
          `<div class="text-sm"><p class="font-semibold">Ponto de Tiro</p><p>Latitude: ${latitude.toFixed(6)}</p><p>Longitude: ${longitude.toFixed(6)}</p></div>`
        );

      // Handle map click
      mapRef.current.on('click', (e) => {
        if (onLocationChange) {
          onLocationChange(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      markerRef.current.setPopupContent(
        `<div class="text-sm"><p class="font-semibold">Ponto de Tiro</p><p>Latitude: ${latitude.toFixed(6)}</p><p>Longitude: ${longitude.toFixed(6)}</p></div>`
      );
    }

    // Center map on marker
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
    }

    // Limpar todos os marcadores antigos
    clearAllMarkers();

    // Draw or remove lines based on distanciaX
    if (distanciaX > 0) {
      // Linha A: Direcao de Tiro
      drawLine('A', direcaoTiro, '#FF0000', '5, 5', 'A', latitude, longitude, distanciaX);

      // Linha B: Direcao de Tiro + Angulo de Dispersao
      drawLine('B', direcaoTiro + anguloDispersao, '#00AA00', '2, 2', 'B', latitude, longitude, distanciaX);

      // Linha C: Direcao de Tiro - Angulo de Dispersao
      drawLine('C', direcaoTiro - anguloDispersao, '#00AA00', '2, 2', 'C', latitude, longitude, distanciaX);

      // Calcular comprimento de D e E: Distancia W / sin(Angulo P)
      let distanciaD = distanciaX; // Default
      if (anguloP !== 0 && distanciaW > 0) {
        const sinAnguloP = Math.sin((anguloP * Math.PI) / 180);
        if (sinAnguloP !== 0) {
          distanciaD = distanciaW / sinAnguloP;
        }
      }

      // Calcular ângulo B: Angulo P - arctan(Distancia A / Distancia X)
      let anguloB = anguloP; // Default
      if (distanciaX > 0 && distanciaA > 0) {
        const arcsinValue = Math.asin(distanciaW / distanciaX) * (180 / Math.PI);
        anguloB = arcsinValue;
      }

      // Calcular comprimento de F e G usando lei dos cossenos com ângulo B
      // comprimento = sqrt(D^2 + X^2 - 2*D*X*cos(B))
      let distanciaF = distanciaX; // Default
      const cosAnguloB = Math.cos((anguloB * Math.PI) / 180);
      const tanAnguloP = Math.tan((anguloP * Math.PI) / 180);
      distanciaF = (distanciaX * cosAnguloB) - (distanciaW / tanAnguloP )
      //const distanciaFSquared = (distanciaD * distanciaD) + (distanciaX * distanciaX) - (2 * distanciaD * distanciaX * cosAnguloB);
      //if (distanciaFSquared > 0) {
      //  distanciaF = Math.sqrt(distanciaFSquared);
      //}

      // Linha D: Direcao de Tiro + Angulo de Dispersao + Angulo P
      drawLine('D', direcaoTiro + anguloDispersao + anguloP, '#0000FF', '1, 1', 'D', latitude, longitude, distanciaD);

      // Linha E: Direcao de Tiro - Angulo de Dispersao - Angulo P
      drawLine('E', direcaoTiro - anguloDispersao - anguloP, '#0000FF', '1, 1', 'E', latitude, longitude, distanciaD);

      // Calcular pontos finais de D e E para origem de F e G
      const [endLatD, endLngD] = calculateDestinationPoint(
        latitude,
        longitude,
        direcaoTiro + anguloDispersao + anguloP,
        distanciaD
      );

      const [endLatE, endLngE] = calculateDestinationPoint(
        latitude,
        longitude,
        direcaoTiro - anguloDispersao - anguloP,
        distanciaD
      );

      // Linha F: Paralela a B, com origem em D, comprimento calculado
      const bearingB = direcaoTiro + anguloDispersao;
      drawLine('F', bearingB, '#0000FF', '1, 1', 'F', endLatD, endLngD, distanciaF);

      // Linha G: Paralela a C, com origem em E, comprimento = comprimento de F
      const bearingC = direcaoTiro - anguloDispersao;
      drawLine('G', bearingC, '#0000FF', '1, 1', 'G', endLatE, endLngE, distanciaF);

      // Desenhar arco
      drawArc();

      // Desenhar linhas H e I apenas para municao Explosiva
      if (municao === 'explosiva' && distanciaA > 0) {
        // Calcular comprimento de H e I: Distancia A / sin(25 graus)
        const sin25 = Math.sin((25 * Math.PI) / 180);
        const distanciaH = sin25 !== 0 ? distanciaA / sin25 : distanciaX;

        // Linha H: Direcao de Tiro + 25 + Angulo de Dispersao + Angulo P
        const bearingH = direcaoTiro + 25 + anguloDispersao + anguloP;
        drawLine('H', bearingH, '#FF0000', '1, 1', 'H', latitude, longitude, distanciaH);

        // Linha I: Direcao de Tiro - 25 - Angulo de Dispersao - Angulo P
        const bearingI = direcaoTiro - 25 - anguloDispersao - anguloP;
        drawLine('I', bearingI, '#FF0000', '1, 1', 'I', latitude, longitude, distanciaH);

        // Calcular pontos finais de H e I
        const [endLatH, endLngH] = calculateDestinationPoint(
          latitude,
          longitude,
          bearingH,
          distanciaH
        );

        const [endLatI, endLngI] = calculateDestinationPoint(
          latitude,
          longitude,
          bearingI,
          distanciaH
        );

        // Calcular comprimento de J e K
        // comprimento = D + (A/sin(P)) - (A/tan(P)) - (A/tan(25))
        const sinAnguloP = Math.sin((anguloP * Math.PI) / 180);
        
        const tan25 = Math.tan((25 * Math.PI) / 180);
        
        let distanciaJ = distanciaD;
        if (sinAnguloP !== 0 && tanAnguloP !== 0 && tan25 !== 0) {
          distanciaJ = distanciaD + (distanciaA / sinAnguloP) - (distanciaA / tanAnguloP) - (distanciaA / tan25);
        }

        // Linha J: Paralela a D, com origem em H
        const bearingD = direcaoTiro + anguloDispersao + anguloP;
        drawLine('J', bearingD,'#FF0000', '1, 1', 'J', endLatH, endLngH, distanciaJ);

        // Linha K: Paralela a E, com origem em I
        const bearingE = direcaoTiro - anguloDispersao - anguloP;
        drawLine('K', bearingE, '#FF0000', '1, 1', 'K', endLatI, endLngI, distanciaJ);

        // Calcular pontos finais de J e K
        const [endLatJ, endLngJ] = calculateDestinationPoint(
          endLatH,
          endLngH,
          bearingD,
          distanciaJ
        );

        const [endLatK, endLngK] = calculateDestinationPoint(
          endLatI,
          endLngI,
          bearingE,
          distanciaJ
        );

        // Linha L: Paralela a F, com origem em J
        const bearingF = direcaoTiro + anguloDispersao;
        const raioCirculo = distanciaX + distanciaB;
        const bearingG = direcaoTiro - anguloDispersao;
        
        // Calcular angulo L = arcsin((A + W) / R)
        const R = 6371000;
        const anguloLRad = Math.asin((distanciaA + distanciaW) / distanciaX);
        
        // Comprimento de L e M = (X + B) * cos(L) - J * cos(P) - H * cos(P + 25)
        const cosAnguloL = Math.cos(anguloLRad);
        const cosAnguloP = Math.cos((anguloP * Math.PI) / 180);
        const cosAngloPPlus25 = Math.cos(((anguloP + 25) * Math.PI) / 180);
        
        const distanciaL = (raioCirculo * cosAnguloL) - distanciaJ * cosAnguloP - distanciaH * cosAngloPPlus25;
        const distanciaM = distanciaL;
        
        drawLine('L', bearingF, '#FF0000', '1, 1', 'L', endLatJ, endLngJ, Math.max(0, distanciaL));
        drawLine('M', bearingG, '#FF0000', '1, 1', 'M', endLatK, endLngK, Math.max(0, distanciaM));

        // Desenhar arco do circulo maior: centro na origem, raio = Distancia X + Distancia B
        // Angulo = Angulo de Dispersao + arcsin((A+W)/(X+B))
        if (linesRef.current.circle) {
          mapRef.current!.removeLayer(linesRef.current.circle);
        }
        if (raioCirculo > 0) {
          // Calcular angulo adicional para o arco do circulo maior
          const sinValueCircle = (distanciaA + distanciaW) / raioCirculo;
          let arcsinValueCircle = 0;
          if (sinValueCircle <= 1) {
            arcsinValueCircle = Math.asin(sinValueCircle) * (180 / Math.PI);
          }
          
          const anguloArcCircle = anguloDispersao + arcsinValueCircle;
          const bearingCircleLeft = direcaoTiro - anguloArcCircle;
          const bearingCircleRight = direcaoTiro + anguloArcCircle;
          
          // Desenhar arco do circulo maior
          const arcPointsCircle = createArcPoints(
            latitude,
            longitude,
            raioCirculo,
            bearingCircleLeft,
            bearingCircleRight,
            150
          );
          
          linesRef.current.circle = L.polyline(arcPointsCircle, {
            color: '#FF0000',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 5',
          }).addTo(mapRef.current!);
        }
      } else {
        removeLine('H');
        removeLine('I');
        removeLine('J');
        removeLine('K');
        removeLine('L');
        removeLine('M');
        removeLine('circle');
      }
    } else {
      // Remove all lines if distanciaX is 0
      removeLine('A');
      removeLine('B');
      removeLine('C');
      removeLine('D');
      removeLine('E');
      removeLine('F');
      removeLine('G');
      removeLine('arc');
      removeLine('H');
      removeLine('I');
      removeLine('J');
      removeLine('K');
    }
  }, [latitude, longitude, municao, direcaoTiro, distanciaX, anguloDispersao, anguloP, distanciaW, distanciaA, distanciaB, onLocationChange]);

  const handleLayerChange = (layerId: string) => {
    setCurrentLayer(layerId);
    if (mapRef.current) {
      // Remove all tile layers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current!.removeLayer(layer);
        }
      });

      // Add new tile layer
      const selectedLayer = layers.find((l) => l.id === layerId);
      if (selectedLayer) {
        L.tileLayer(selectedLayer.url, {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }
    }
  };

  

  return (
    <div className="relative w-full h-full">
      <div id="map" className="w-full h-full" />
      <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg">
        <div className="text-xs font-semibold mb-2">Camadas:</div>
        <div className="space-y-1">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer.id)}
              className={`block w-full text-left px-2 py-1 text-sm rounded transition ${
                currentLayer === layer.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg text-xs">
        <div className="font-semibold mb-2">Legenda:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500" style={{ borderTop: '3px dashed red' }}></div>
            <span>Linha A (Direcao Tiro)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500" style={{ borderTop: '2px dashed green' }}></div>
            <span>Linhas B e C (±Dispersao)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500" style={{ borderTop: '1px dashed blue' }}></div>
            <span>Linhas D e E (W/cos(P))</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-orange-500" style={{ borderTop: '2px dashed orange' }}></div>
            <span>Linhas F e G (Paralelas B/C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-purple-500" style={{ borderTop: '3px dashed purple' }}></div>
            <span>Arco (F a G)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

