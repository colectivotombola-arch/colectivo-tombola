import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Winner {
  id: string;
  name: string;
  prize: string;
  image_url?: string;
  date_won: string;
  description?: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

const AdminWinners = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);

  const [newWinner, setNewWinner] = useState({
    name: '',
    prize: '',
    image_url: '',
    date_won: new Date().toISOString().split('T')[0],
    description: '',
    position: 1
  });

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('winners')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setWinners((data || []) as Winner[]);
    } catch (error) {
      console.error('Error loading winners:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los ganadores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createWinner = async () => {
    setSaving(true);
    try {
      const { data, error } = await (supabase as any)
        .from('winners')
        .insert([{
          ...newWinner,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Ganador agregado!",
        description: `Se agregó el ganador "${newWinner.name}"`,
      });

      setIsCreateDialogOpen(false);
      setNewWinner({
        name: '',
        prize: '',
        image_url: '',
        date_won: new Date().toISOString().split('T')[0],
        description: '',
        position: 1
      });
      
      loadWinners();
    } catch (error) {
      console.error('Error creating winner:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el ganador",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateWinner = async () => {
    if (!editingWinner) return;
    
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('winners')
        .update({
          name: editingWinner.name,
          prize: editingWinner.prize,
          image_url: editingWinner.image_url,
          date_won: editingWinner.date_won,
          description: editingWinner.description,
          position: editingWinner.position,
          is_active: editingWinner.is_active
        })
        .eq('id', editingWinner.id);

      if (error) throw error;

      toast({
        title: "¡Ganador actualizado!",
        description: `Se actualizó el ganador "${editingWinner.name}"`,
      });

      setIsEditDialogOpen(false);
      setEditingWinner(null);
      loadWinners();
    } catch (error) {
      console.error('Error updating winner:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el ganador",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteWinner = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ganador?')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('winners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Ganador eliminado",
        description: "El ganador se eliminó correctamente",
      });
      
      loadWinners();
    } catch (error) {
      console.error('Error deleting winner:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el ganador",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (winner: Winner) => {
    setEditingWinner({ ...winner });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ganadores...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Ganadores Anteriores" 
      subtitle="Gestiona y muestra los ganadores de rifas anteriores"
    >
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-aqua hover:shadow-aqua">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Ganador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Ganador</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo ganador
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="winner_name">Nombre del Ganador *</Label>
                  <Input
                    id="winner_name"
                    value={newWinner.name}
                    onChange={(e) => setNewWinner(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                
                <div>
                  <Label htmlFor="winner_prize">Premio Ganado *</Label>
                  <Input
                    id="winner_prize"
                    value={newWinner.prize}
                    onChange={(e) => setNewWinner(prev => ({ ...prev, prize: e.target.value }))}
                    placeholder="Ej: Toyota Fortuner 4x4"
                  />
                </div>
                
                <div>
                  <Label>Foto del Ganador</Label>
                  <ImageUpload
                    value={newWinner.image_url}
                    onChange={(url) => setNewWinner(prev => ({ ...prev, image_url: url }))}
                    bucket="prize-images"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="winner_date">Fecha de Ganador</Label>
                    <Input
                      id="winner_date"
                      type="date"
                      value={newWinner.date_won}
                      onChange={(e) => setNewWinner(prev => ({ ...prev, date_won: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="winner_position">Posición de Visualización</Label>
                    <Input
                      id="winner_position"
                      type="number"
                      value={newWinner.position}
                      onChange={(e) => setNewWinner(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="winner_description">Descripción (Opcional)</Label>
                  <Textarea
                    id="winner_description"
                    value={newWinner.description}
                    onChange={(e) => setNewWinner(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Información adicional sobre el ganador..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createWinner}
                    disabled={saving || !newWinner.name || !newWinner.prize}
                    className="bg-gradient-aqua hover:shadow-aqua"
                  >
                    {saving ? 'Agregando...' : 'Agregar Ganador'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Winners Grid */}
        {winners.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No hay ganadores registrados</h3>
            <p className="text-muted-foreground mb-4">Agrega el primer ganador para comenzar la galería</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-aqua hover:shadow-aqua"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Ganador
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner) => (
              <Card key={winner.id} className="overflow-hidden">
                {winner.image_url && (
                  <div className="aspect-video bg-muted">
                    <img 
                      src={winner.image_url} 
                      alt={winner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{winner.name}</span>
                    <Trophy className="w-5 h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-primary">{winner.prize}</p>
                    <p className="text-sm text-muted-foreground">
                      Ganado el: {new Date(winner.date_won).toLocaleDateString()}
                    </p>
                    {winner.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {winner.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openEditDialog(winner)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteWinner(winner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Ganador</DialogTitle>
              <DialogDescription>
                Actualiza la información del ganador
              </DialogDescription>
            </DialogHeader>
            
            {editingWinner && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_winner_name">Nombre del Ganador *</Label>
                  <Input
                    id="edit_winner_name"
                    value={editingWinner.name}
                    onChange={(e) => setEditingWinner(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_winner_prize">Premio Ganado *</Label>
                  <Input
                    id="edit_winner_prize"
                    value={editingWinner.prize}
                    onChange={(e) => setEditingWinner(prev => prev ? ({ ...prev, prize: e.target.value }) : null)}
                    placeholder="Ej: Toyota Fortuner 4x4"
                  />
                </div>
                
                <div>
                  <Label>Foto del Ganador</Label>
                  <ImageUpload
                    value={editingWinner.image_url || ''}
                    onChange={(url) => setEditingWinner(prev => prev ? ({ ...prev, image_url: url }) : null)}
                    bucket="prize-images"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_winner_date">Fecha de Ganador</Label>
                    <Input
                      id="edit_winner_date"
                      type="date"
                      value={editingWinner.date_won}
                      onChange={(e) => setEditingWinner(prev => prev ? ({ ...prev, date_won: e.target.value }) : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_winner_position">Posición de Visualización</Label>
                    <Input
                      id="edit_winner_position"
                      type="number"
                      value={editingWinner.position}
                      onChange={(e) => setEditingWinner(prev => prev ? ({ ...prev, position: parseInt(e.target.value) || 1 }) : null)}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_winner_description">Descripción (Opcional)</Label>
                  <Textarea
                    id="edit_winner_description"
                    value={editingWinner.description || ''}
                    onChange={(e) => setEditingWinner(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    placeholder="Información adicional sobre el ganador..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={updateWinner}
                    disabled={saving || !editingWinner.name || !editingWinner.prize}
                    className="bg-gradient-aqua hover:shadow-aqua"
                  >
                    {saving ? 'Actualizando...' : 'Actualizar Ganador'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminWinners;