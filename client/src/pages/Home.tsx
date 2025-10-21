import { useState } from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import BallisticsForm, { BallisticsData } from '@/components/BallisticsForm';

export default function Home() {
  const [mapLocation, setMapLocation] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
  });

  const [ballisticsData, setBallisticsData] = useState<BallisticsData | null>(null);

  const handleFormSubmit = (data: BallisticsData) => {
    setBallisticsData(data);
    setMapLocation({
      latitude: data.latitude,
      longitude: data.longitude,
    });
    console.log('Dados balísticos recebidos:', data);
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    setMapLocation({
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mapa Balístico Interativo</h1>
          <p className="text-gray-600 text-sm mt-1">Visualize trajetórias e parâmetros de tiro no mapa</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BallisticsForm
                onSubmit={handleFormSubmit}
                initialData={mapLocation}
              />
              
              {/* Info Box */}
              {ballisticsData && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Dados Carregados</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Munição:</strong> {ballisticsData.munição}</p>
                    <p><strong>Tipo:</strong> {ballisticsData.tipoImpacto}</p>
                    <p><strong>Altura Máx:</strong> {ballisticsData.alturaMaxima}m</p>
                    <p><strong>Direção:</strong> {ballisticsData.direcaoTiro}°</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mapa - Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
              <InteractiveMap
                latitude={mapLocation.latitude}
                longitude={mapLocation.longitude}
                municao={ballisticsData?.munição || 'explosiva'}
                direcaoTiro={ballisticsData?.direcaoTiro || 0}
                distanciaX={ballisticsData?.distanciaX || 0}
                anguloDispersao={ballisticsData?.anguloDispersao || 0}
                anguloP={ballisticsData?.anguloP || 0}
                distanciaW={ballisticsData?.distanciaW || 0}
                distanciaA={ballisticsData?.distanciaA || 0}
                distanciaB={ballisticsData?.distanciaB || 0}
                onLocationChange={handleMapLocationChange}
              />
            </div>
            
            {/* Coordenadas Display */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">
                <strong>Coordenadas Atuais:</strong> {mapLocation.latitude.toFixed(6)}, {mapLocation.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Clique no mapa para atualizar as coordenadas</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

