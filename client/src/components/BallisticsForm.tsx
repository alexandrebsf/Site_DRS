import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BallisticsData {
  // Parâmetros de munição/impacto
  munição: 'explosiva' | 'nao-explosiva';
  tipoImpacto: 'terra' | 'metal';
  anguloDispersao: number;
  distanciaX: number;
  anguloP: number;
  distanciaW: number;
  distanciaA: number;
  distanciaB: number;
  alturaMaxima: number;
  // Parâmetros de localização
  latitude: number;
  longitude: number;
  direcaoTiro: number;
}

interface BallisticsFormProps {
  onSubmit: (data: BallisticsData) => void;
  initialData?: Partial<BallisticsData>;
}

export default function BallisticsForm({ onSubmit, initialData }: BallisticsFormProps) {
  const [formData, setFormData] = useState<BallisticsData>({
    munição: initialData?.munição || 'explosiva',
    tipoImpacto: initialData?.tipoImpacto || 'terra',
    anguloDispersao: initialData?.anguloDispersao ?? 5,
    distanciaX: initialData?.distanciaX ?? 5474,
    anguloP: initialData?.anguloP ?? 24,
    distanciaW: initialData?.distanciaW ?? 1225,
    distanciaA: initialData?.distanciaA ?? 615,
    distanciaB: initialData?.distanciaB ?? 615,
    alturaMaxima: initialData?.alturaMaxima ?? 1090,
    latitude: initialData?.latitude || -23.5505,
    longitude: initialData?.longitude || -46.6333,
    direcaoTiro: initialData?.direcaoTiro || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Parâmetros Balísticos</CardTitle>
        <CardDescription>Configure os parâmetros de munição e localização</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção de Munição */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Munição e Impacto</h3>
            
            <div className="space-y-2">
              <Label htmlFor="munição">Munição</Label>
              <Select
                value={formData.munição}
                onValueChange={(value) => handleSelectChange('munição', value)}
              >
                <SelectTrigger id="munição">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explosiva">Explosiva</SelectItem>
                  <SelectItem value="nao-explosiva">Não explosiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoImpacto">Tipo de Impacto</Label>
              <Select
                value={formData.tipoImpacto}
                onValueChange={(value) => handleSelectChange('tipoImpacto', value)}
              >
                <SelectTrigger id="tipoImpacto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terra">Terra</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anguloDispersao">Ângulo Dispersão (°)</Label>
                <Input
                  id="anguloDispersao"
                  name="anguloDispersao"
                  type="number"
                  step="0.1"
                  value={formData.anguloDispersao}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanciaX">Distância X (m)</Label>
                <Input
                  id="distanciaX"
                  name="distanciaX"
                  type="number"
                  step="0.1"
                  value={formData.distanciaX}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anguloP">Ângulo P (°)</Label>
                <Input
                  id="anguloP"
                  name="anguloP"
                  type="number"
                  step="0.1"
                  value={formData.anguloP}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanciaW">Distância W (m)</Label>
                <Input
                  id="distanciaW"
                  name="distanciaW"
                  type="number"
                  step="0.1"
                  value={formData.distanciaW}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distanciaA">Distância A (m)</Label>
                <Input
                  id="distanciaA"
                  name="distanciaA"
                  type="number"
                  step="0.1"
                  value={formData.distanciaA}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanciaB">Distância B (m)</Label>
                <Input
                  id="distanciaB"
                  name="distanciaB"
                  type="number"
                  step="0.1"
                  value={formData.distanciaB}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alturaMaxima">Altura Máxima (m)</Label>
              <Input
                id="alturaMaxima"
                name="alturaMaxima"
                type="number"
                step="0.1"
                value={formData.alturaMaxima}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Seção de Localização */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Localização</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direcaoTiro">Direção de Tiro (°)</Label>
              <Input
                id="direcaoTiro"
                name="direcaoTiro"
                type="number"
                step="0.1"
                min="0"
                max="360"
                value={formData.direcaoTiro}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Calcular Trajetória
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

