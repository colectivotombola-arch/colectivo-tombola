import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { purchaseConfirmationsAPI, rafflesAPI, type PurchaseConfirmation, type Raffle } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  User,
  Hash,
  DollarSign,
  RefreshCw
} from 'lucide-react';

const AdminConfirmations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [confirmations, setConfirmations] = useState<PurchaseConfirmation[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [confirmationsData, rafflesData] = await Promise.all([
        purchaseConfirmationsAPI.getAll(),
        rafflesAPI.getAll()
      ]);
      
      setConfirmations(confirmationsData);
      setRaffles(rafflesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las confirmaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (confirmationId: string, newStatus: string) => {
    setUpdating(confirmationId);
    try {
      const success = await purchaseConfirmationsAPI.updateStatus(confirmationId, newStatus);
      
      if (success) {
        setConfirmations(prev => 
          prev.map(conf => 
            conf.id === confirmationId 
              ? { ...conf, status: newStatus }
              : conf
          )
        );
        
        toast({
          title: "¡Éxito!",
          description: `Estado actualizado a ${newStatus}`,
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRaffleName = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    return raffle?.title || 'Rifa no encontrada';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Confirmaciones de Compra" subtitle="Cargando confirmaciones...">
        <div className="flex items-center justify-center py-12">
          <div className="text-primary">Cargando confirmaciones...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Confirmaciones de Compra" 
      subtitle={`Gestiona las ${confirmations.length} confirmaciones de compra`}
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Botón de actualizar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Pendientes: {confirmations.filter(c => c.status === 'pending').length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Confirmadas: {confirmations.filter(c => c.status === 'paid').length}
            </Badge>
          </div>
          <Button onClick={loadData} variant="outline" className="touch-target">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Lista de confirmaciones */}
        <div className="space-y-4">
          {confirmations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No hay confirmaciones de compra</p>
              </CardContent>
            </Card>
          ) : (
            confirmations.map((confirmation) => (
              <Card key={confirmation.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(confirmation.status)} flex items-center gap-1`}>
                        {getStatusIcon(confirmation.status)}
                        {confirmation.status || 'pending'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(confirmation.created_at || '').toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {confirmation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(confirmation.id!, 'paid')}
                            disabled={updating === confirmation.id}
                            className="bg-green-600 hover:bg-green-700 touch-target"
                          >
                            {updating === confirmation.id ? 'Actualizando...' : 'Marcar como Pagado'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(confirmation.id!, 'cancelled')}
                            disabled={updating === confirmation.id}
                            className="touch-target"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {confirmation.status === 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(confirmation.id!, 'pending')}
                          disabled={updating === confirmation.id}
                          className="touch-target"
                        >
                          Marcar como Pendiente
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Información del cliente */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Cliente
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Nombre:</strong> {confirmation.buyer_name}</p>
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {confirmation.buyer_email}
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {confirmation.buyer_phone}
                        </p>
                      </div>
                    </div>

                    {/* Información de la compra */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Compra
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Rifa:</strong> {getRaffleName(confirmation.raffle_id)}</p>
                        <p><strong>Cantidad:</strong> {confirmation.quantity} boletos</p>
                        <p><strong>Total:</strong> ${confirmation.total_amount}</p>
                        <p><strong>Método:</strong> {confirmation.payment_method || 'whatsapp'}</p>
                      </div>
                    </div>

                    {/* Números asignados */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Números
                      </h4>
                      <div className="text-sm">
                        <p><strong>Confirmación:</strong> {confirmation.confirmation_number}</p>
                        {confirmation.assigned_numbers && confirmation.assigned_numbers.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium mb-1">Números asignados:</p>
                            <div className="flex flex-wrap gap-1">
                              {confirmation.assigned_numbers.map(num => (
                                <Badge key={num} variant="outline" className="text-xs">
                                  {num}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConfirmations;