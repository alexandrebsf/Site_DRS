/**
 * Utilitários para cálculos balísticos e geométricos
 */

/**
 * Calcula o ponto final dado um ponto inicial, direção e distância
 * @param lat Latitude inicial (em graus)
 * @param lng Longitude inicial (em graus)
 * @param bearing Direção em graus (0-360, onde 0 é Norte)
 * @param distanceMeters Distância em metros
 * @returns [latitude, longitude] do ponto final
 */
export function calculateDestinationPoint(
  lat: number,
  lng: number,
  bearing: number,
  distanceMeters: number
): [number, number] {
  const R = 6371000; // Raio da Terra em metros
  const φ1 = (lat * Math.PI) / 180; // Latitude inicial em radianos
  const λ1 = (lng * Math.PI) / 180; // Longitude inicial em radianos
  const θ = (bearing * Math.PI) / 180; // Bearing em radianos
  const d = distanceMeters / R; // Distância angular

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ)
  );

  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(d) * Math.cos(φ1),
      Math.cos(d) - Math.sin(φ1) * Math.sin(φ2)
    );

  return [(φ2 * 180) / Math.PI, (λ2 * 180) / Math.PI];
}

/**
 * Cria um array de pontos para desenhar uma linha entre dois pontos
 * @param lat1 Latitude inicial
 * @param lng1 Longitude inicial
 * @param lat2 Latitude final
 * @param lng2 Longitude final
 * @param steps Número de pontos intermediários
 * @returns Array de [latitude, longitude]
 */
export function createLinePoints(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  steps: number = 50
): [number, number][] {
  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lng1 + (lng2 - lng1) * t;
    points.push([lat, lng]);
  }

  return points;
}

/**
 * Normaliza um bearing para o intervalo 0-360
 */
export function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}



/**
 * Calcula um ponto perpendicular a uma linha, a uma distancia especificada
 * @param lat Latitude do ponto na linha
 * @param lng Longitude do ponto na linha
 * @param bearing Direcao da linha (em graus)
 * @param distanceMeters Distancia perpendicular (positivo = direita, negativo = esquerda)
 * @returns [latitude, longitude] do ponto perpendicular
 */
export function calculatePerpendicularPoint(
  lat: number,
  lng: number,
  bearing: number,
  distanceMeters: number
): [number, number] {
  // Bearing perpendicular (90 graus a direita)
  const perpendicularBearing = normalizeBearing(bearing + 90);
  return calculateDestinationPoint(lat, lng, perpendicularBearing, distanceMeters);
}



/**
 * Cria pontos para desenhar um arco de circunferência
 * @param centerLat Latitude do centro
 * @param centerLng Longitude do centro
 * @param radiusMeters Raio em metros
 * @param startBearing Bearing inicial (em graus)
 * @param endBearing Bearing final (em graus)
 * @param numPoints Número de pontos para suavidade
 * @returns Array de [latitude, longitude]
 */
export function createArcPoints(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  startBearing: number,
  endBearing: number,
  numPoints: number = 100
): [number, number][] {
  const points: [number, number][] = [];
  
  // Normalizar bearings
  let start = normalizeBearing(startBearing);
  let end = normalizeBearing(endBearing);
  
  // Se end < start, significa que o arco passa pelo norte (0°)
  // Neste caso, precisamos ajustar o cálculo
  if (end < start) {
    end += 360;
  }
  
  const step = (end - start) / (numPoints - 1);
  
  for (let i = 0; i < numPoints; i++) {
    const bearing = start + step * i;
    const [lat, lng] = calculateDestinationPoint(centerLat, centerLng, bearing, radiusMeters);
    points.push([lat, lng]);
  }
  
  return points;
}

/**
 * Calcula o comprimento de uma linha que parte de um ponto com um bearing específico
 * até intersectar um círculo centrado na origem com raio especificado
 * @param originLat - Latitude do ponto de origem
 * @param originLng - Longitude do ponto de origem
 * @param bearing - Direção em graus (0-360)
 * @param circleCenterLat - Latitude do centro do círculo
 * @param circleCenterLng - Longitude do centro do círculo
 * @param circleRadius - Raio do círculo em metros
 * @returns Distância em metros até a intersecção com o círculo
 */
export function calculateDistanceToCircleIntersection(
  originLat: number,
  originLng: number,
  bearing: number,
  circleCenterLat: number,
  circleCenterLng: number,
  circleRadius: number
): number {
  // Usar uma abordagem robusta: testar pontos ao longo da linha
  const R = 6371000; // Raio da Terra em metros
  const maxDistance = circleRadius * 2; // Distância máxima a testar
  const step = maxDistance / 100; // Incremento de teste
  
  let lastDistance = 0;
  let lastDistanceToCircle = circleRadius; // Começamos fora do círculo
  
  // Testar pontos ao longo da linha
  for (let distance = step; distance <= maxDistance; distance += step) {
    const [testLat, testLng] = calculateDestinationPoint(
      originLat,
      originLng,
      bearing,
      distance
    );
    
    // Calcular distância do ponto ao centro do círculo
    const lat1 = (testLat * Math.PI) / 180;
    const lng1 = (testLng * Math.PI) / 180;
    const lat2 = (circleCenterLat * Math.PI) / 180;
    const lng2 = (circleCenterLng * Math.PI) / 180;
    
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceToCircleCenter = R * c;
    
    // Se cruzamos o círculo, interpolar para encontrar o ponto exato
    if (distanceToCircleCenter <= circleRadius) {
      // Interpolação linear entre o último ponto e este
      if (lastDistanceToCircle === circleRadius) {
        // Primeiro ponto dentro do círculo
        return distance;
      }
      const ratio = (circleRadius - lastDistanceToCircle) / (distanceToCircleCenter - lastDistanceToCircle);
      return lastDistance + (distance - lastDistance) * ratio;
    }
    
    lastDistance = distance;
    lastDistanceToCircle = distanceToCircleCenter;
  }
  
  // Se não encontrou intersecção, retornar a distância máxima
  return maxDistance;
}

