import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BallisticsData {
  munição: 'explosiva' | 'nao-explosiva';
  tipoImpacto: 'terra' | 'metal';
  anguloDispersao: number;
  distanciaX: number;
  anguloP: number;
  distanciaW: number;
  distanciaA: number;
  distanciaB: number;
  alturaMaxima: number;
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
    latitude: initialData?.latitude || -15.6679,
    longitude: initialData?.longitude || -47.2298,
    direcaoTiro: initialData?.direcaoTiro || 193,
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Parâmetros Balísticos</CardTitle>
        <CardDescription className="text-xs">Configure munição e localização</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seção Munição */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Munição e Impacto</h3>

            {/* Linha 1: munição e tipo de impacto */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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

              <div className="space-y-1">
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
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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
              <div className="space-y-1">
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

            {/* Linha 3 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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
              <div className="space-y-1">
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

            {/* Linha 4 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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
              <div className="space-y-1">
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

            {/* Linha 5 */}
            <div className="space-y-1">
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

          {/* Seção Localização */}
          <div className="space-y-2 pt-3 border-t">
            <h3 className="font-semibold text-sm">Localização</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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
              <div className="space-y-1">
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

            <div className="space-y-1">
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

          <Button type="submit" className="w-full mt-3">
            Calcular Trajetória
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



