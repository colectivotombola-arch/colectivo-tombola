import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, type Raffle } from '@/lib/supabase';
import { Gift, Plus, Trash2, Save } from 'lucide-react';

interface InstantPrize {
  number: string;
  claimed: boolean;
  prize_amount?: number;
}

interface InstantPrizesManagerProps {
  raffle: Raffle;
  onUpdate: () => void;
}

const InstantPrizesManager = ({ raffle, onUpdate }: InstantPrizesManagerProps) => {
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<InstantPrize[]>([]);
  const [newPrizeNumber, setNewPrizeNumber] = useState('');
  const [newPrizeAmount, setNewPrizeAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (raffle.instant_prizes) {
      try {
        const parsedPrizes = Array.isArray(raffle.instant_prizes) 
          ? raffle.instant_prizes 
          : JSON.parse(raffle.instant_prizes);
        setPrizes(parsedPrizes || []);
      } catch (error) {
        console.error('Error parsing instant prizes:', error);
        setPrizes([]);
      }
    }
  }, [raffle.instant_prizes]);

  const addPrize = () => {
    if (!newPrizeNumber || !newPrizeAmount) {
      toast({
        title: "Error",
        description: "Por favor completa el número y el monto del premio",
        variant: "destructive",
      });
      return;
    }

    const number = parseInt(newPrizeNumber);
    if (number < 1 || number > raffle.total_numbers) {
      toast({
        title: "Error",
        description: `El número debe estar entre 1 y ${raffle.total_numbers}`,
        variant: "destructive",
      });
      return;
    }

    if (prizes.some(p => p.number === newPrizeNumber)) {
      toast({
        title: "Error",
        description: "Ya existe un premio para ese número",
        variant: "destructive",
      });
      return;
    }

    const newPrize: InstantPrize = {
      number: newPrizeNumber,
      claimed: false,
      prize_amount: parseFloat(newPrizeAmount)
    };

    setPrizes([...prizes, newPrize]);
    setNewPrizeNumber('');
    setNewPrizeAmount('');
  };

  const removePrize = (number: string) => {
    setPrizes(prizes.filter(p => p.number !== number));
  };

  const toggleClaimed = (number: string) => {
    setPrizes(prizes.map(p => 
      p.number === number ? { ...p, claimed: !p.claimed } : p
    ));
  };

  const generateRandomPrizes = () => {
    const count = 10;
    const existingNumbers = prizes.map(p => parseInt(p.number));
    const newPrizes: InstantPrize[] = [];
    
    while (newPrizes.length < count) {
      const randomNumber = Math.floor(Math.random() * raffle.total_numbers) + 1;
      if (!existingNumbers.includes(randomNumber) && !newPrizes.some(p => p.number === randomNumber.toString())) {
        newPrizes.push({
          number: randomNumber.toString(),
          claimed: false,
          prize_amount: 50 // Monto por defecto
        });
      }
    }
    
    setPrizes([...prizes, ...newPrizes]);
    toast({
      title: "¡Premios generados!",
      description: `Se generaron ${newPrizes.length} números con premios aleatorios`,
    });
  };

  const savePrizes = async () => {
    setSaving(true);
    try {
      await rafflesAPI.update(raffle.id!, {
        instant_prizes: prizes
      });
      
      toast({
        title: "¡Premios guardados!",
        description: "Los premios instantáneos se actualizaron correctamente",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error saving instant prizes:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los premios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Premios Instantáneos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new prize */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prize_number">Número</Label>
            <Input
              id="prize_number"
              type="number"
              value={newPrizeNumber}
              onChange={(e) => setNewPrizeNumber(e.target.value)}
              placeholder="Ej: 123"
              min="1"
              max={raffle.total_numbers}
            />
          </div>
          <div>
            <Label htmlFor="prize_amount">Monto ($)</Label>
            <Input
              id="prize_amount"
              type="number"
              step="0.01"
              value={newPrizeAmount}
              onChange={(e) => setNewPrizeAmount(e.target.value)}
              placeholder="Ej: 50.00"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addPrize} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateRandomPrizes}
            disabled={prizes.length >= raffle.total_numbers}
          >
            Generar 10 aleatorios
          </Button>
          <Button 
            onClick={savePrizes}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Premios'}
          </Button>
        </div>

        {/* Prizes list */}
        {prizes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {prizes
              .sort((a, b) => parseInt(a.number) - parseInt(b.number))
              .map((prize) => (
              <div
                key={prize.number}
                className={`relative p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                  prize.claimed
                    ? 'bg-muted border-muted-foreground opacity-50'
                    : 'bg-primary/10 border-primary hover:bg-primary/20'
                }`}
                onClick={() => toggleClaimed(prize.number)}
              >
                <div className="text-lg font-mono font-bold">{prize.number}</div>
                <div className="text-sm text-muted-foreground">
                  ${prize.prize_amount || 0}
                </div>
                {prize.claimed && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Entregado
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePrize(prize.number);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay premios instantáneos configurados.
            <br />
            Agrega números manualmente o genera algunos aleatorios.
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Instrucciones:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Agrega números que tendrán premios instantáneos</li>
            <li>Haz clic en un número para marcarlo como entregado</li>
            <li>Los números marcados aparecerán tachados para los usuarios</li>
            <li>Puedes generar 10 números aleatorios rápidamente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstantPrizesManager;