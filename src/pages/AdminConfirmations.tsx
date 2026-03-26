import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { purchaseConfirmationsAPI, rafflesAPI, raffleNumbersAPI, supabase, type PurchaseConfirmation, type Raffle } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { normalizeWhatsApp } from '@/lib/numberUtils';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  User,
  Hash,
  DollarSign,
  RefreshCw,
  Building2,
  ExternalLink,
  CreditCard,
  MessageCircle,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Transfer {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  monto_pagado: number;
  numero_referencia?: string;
  comprobante_url?: string;
  raffle_id?: string;
  package_id?: string;
  quantity?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  assigned_numbers?: number[];
}

const AdminConfirmations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [confirmations, setConfirmations] = useState<PurchaseConfirmation[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [expandedPaypal, setExpandedPaypal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [confirmationsData, rafflesData, transfersData] = await Promise.all([
        purchaseConfirmationsAPI.getAll(),
        rafflesAPI.getAll(),
        supabase.from('transferencias').select('*').order('created_at', { ascending: false })
      ]);
      
      setConfirmations(confirmationsData);
      setRaffles(rafflesData);
      setTransfers(transfersData.data || []);
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

  const updateConfirmationStatus = async (confirmationId: string, newStatus: string) => {
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

  const updateTransferStatus = async (transferId: string, newStatus: string) => {
    setUpdating(transferId);
    try {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer) throw new Error('Transfer not found');

      let assignedNumbers: number[] = [];

      if (newStatus === 'aprobado' && transfer.raffle_id && transfer.quantity) {
        // Get existing sold numbers for this raffle
        const existingNumbers = await raffleNumbersAPI.getByRaffle(transfer.raffle_id);
        const existingValues = existingNumbers.map(n => n.number_value);
        
        // Get raffle total to know range
        const raffle = raffles.find(r => r.id === transfer.raffle_id);
        const totalNumbers = raffle?.total_numbers || 1000;

        // Generate unique random numbers
        assignedNumbers = purchaseConfirmationsAPI.generateRandomNumbers(
          transfer.quantity, 
          totalNumbers, 
          existingValues
        );

        // Create a purchase confirmation record with assigned numbers
        const confirmationNumber = `RF${Date.now().toString(36).toUpperCase()}`;
        await supabase.from('purchase_confirmations').insert({
          raffle_id: transfer.raffle_id,
          buyer_name: transfer.nombre,
          buyer_email: transfer.email,
          buyer_phone: transfer.telefono || '',
          quantity: transfer.quantity,
          total_amount: transfer.monto_pagado,
          payment_method: 'transferencia',
          confirmation_number: confirmationNumber,
          status: 'paid',
          assigned_numbers: assignedNumbers,
        });

        // Insert raffle_numbers for progress tracking
        const numberInserts = assignedNumbers.map(num => ({
          raffle_id: transfer.raffle_id!,
          number_value: num,
          buyer_name: transfer.nombre,
          buyer_phone: transfer.telefono || '',
          buyer_email: transfer.email,
          payment_method: 'transferencia',
          payment_status: 'paid',
        }));
        await supabase.from('raffle_numbers').insert(numberInserts);
      }

      const { error } = await supabase
        .from('transferencias')
        .update({ status: newStatus, assigned_numbers: assignedNumbers.length > 0 ? assignedNumbers : undefined })
        .eq('id', transferId);
      
      if (error) throw error;
      
      setTransfers(prev => 
        prev.map(t => 
          t.id === transferId 
            ? { ...t, status: newStatus, assigned_numbers: assignedNumbers }
            : t
        )
      );
      
      if (newStatus === 'aprobado') {
        toast({
          title: "¡Aprobado!",
          description: `Transferencia aprobada. ${assignedNumbers.length} boletos asignados: ${assignedNumbers.join(', ')}`,
        });
      } else {
        toast({
          title: "Actualizado",
          description: `Estado cambiado a ${newStatus}`,
        });
      }
    } catch (error: any) {
      console.error('Error updating transfer:', error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el estado",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const sendWhatsAppNumbers = (transfer: Transfer & { assigned_numbers?: number[] }) => {
    if (!transfer.telefono) {
      toast({ title: "Error", description: "El cliente no tiene número de teléfono", variant: "destructive" });
      return;
    }
    const phone = normalizeWhatsApp(transfer.telefono);
    const raffleName = getRaffleName(transfer.raffle_id);
    const numbers = transfer.assigned_numbers?.join(', ') || 'Sin números asignados';
    const message = `¡Hola ${transfer.nombre}! 👋 Confirmamos tu pago para la rifa *${raffleName}*. 🎟️ Tus números asignados son: *${numbers}*. ¡Mucha suerte y gracias por participar! ✨`;
    const url = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  const sendWhatsAppConfirmation = (confirmation: PurchaseConfirmation) => {
    if (!confirmation.buyer_phone) {
      toast({ title: "Error", description: "El cliente no tiene número de teléfono", variant: "destructive" });
      return;
    }
    const phone = normalizeWhatsApp(confirmation.buyer_phone);
    const raffleName = getRaffleName(confirmation.raffle_id);
    const numbers = confirmation.assigned_numbers?.join(', ') || 'Sin números asignados';
    const message = `¡Hola ${confirmation.buyer_name}! 👋 Confirmamos tu pago para la rifa *${raffleName}*. 🎟️ Tus números asignados son: *${numbers}*. ¡Mucha suerte y gracias por participar! ✨`;
    const url = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resetSorteo = async () => {
    setResetting(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        supabase.from('raffle_numbers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('transferencias').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('purchase_confirmations').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      if (r3.error) throw r3.error;
      setConfirmations([]);
      setTransfers([]);
      toast({ title: "¡Sorteo reiniciado!", description: "Se han eliminado todas las ventas. La configuración del sitio permanece intacta." });
    } catch (error: any) {
      console.error('Error resetting:', error);
      toast({ title: "Error", description: error?.message || "No se pudo reiniciar el sorteo", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  const getRaffleName = (raffleId: string | undefined) => {
    if (!raffleId) return 'No especificada';
    const raffle = raffles.find(r => r.id === raffleId);
    return raffle?.title || 'Rifa no encontrada';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
      case 'aprobado':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'rechazado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingConfirmations = confirmations.filter(c => c.status === 'pending').length;
  const pendingTransfers = transfers.filter(t => t.status === 'pendiente').length;

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
      subtitle={`Gestiona las confirmaciones de PayPal y transferencias`}
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header with stats */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              PayPal: {confirmations.length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Building2 className="w-3 h-3" />
              Transferencias: {transfers.length}
            </Badge>
            {(pendingConfirmations > 0 || pendingTransfers > 0) && (
              <Badge variant="destructive" className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Pendientes: {pendingConfirmations + pendingTransfers}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" className="touch-target">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="touch-target" disabled={resetting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {resetting ? 'Reiniciando...' : 'Reiniciar Sorteo'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Deseas vaciar las ventas actuales?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminarán todos los registros de boletos vendidos, transferencias y confirmaciones de compra. 
                    <strong className="block mt-2">La configuración del sitio, métodos de pago, redes sociales y cuentas bancarias NO se borrarán.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={resetSorteo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sí, reiniciar sorteo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs for PayPal and Transfers */}
        <Tabs defaultValue="paypal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paypal" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              PayPal ({confirmations.length})
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Transferencias ({transfers.length})
            </TabsTrigger>
          </TabsList>

          {/* PayPal Confirmations */}
          <TabsContent value="paypal" className="space-y-4 mt-4">
            {confirmations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay confirmaciones de PayPal</p>
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
                              onClick={() => updateConfirmationStatus(confirmation.id!, 'paid')}
                              disabled={updating === confirmation.id}
                              className="bg-green-600 hover:bg-green-700 touch-target"
                            >
                              {updating === confirmation.id ? 'Actualizando...' : 'Marcar como Pagado'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateConfirmationStatus(confirmation.id!, 'cancelled')}
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
                            onClick={() => updateConfirmationStatus(confirmation.id!, 'pending')}
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

                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Compra
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Rifa:</strong> {getRaffleName(confirmation.raffle_id)}</p>
                          <p><strong>Cantidad:</strong> {confirmation.quantity} boletos</p>
                          <p><strong>Total:</strong> ${confirmation.total_amount}</p>
                          <p><strong>Método:</strong> {confirmation.payment_method || 'PayPal'}</p>
                        </div>
                      </div>

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
          </TabsContent>

          {/* Bank Transfers */}
          <TabsContent value="transfers" className="space-y-4 mt-4">
            {transfers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay transferencias registradas</p>
                </CardContent>
              </Card>
            ) : (
              transfers.map((transfer) => (
                <Card key={transfer.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(transfer.status)} flex items-center gap-1`}>
                          {getStatusIcon(transfer.status)}
                          {transfer.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transfer.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {transfer.status === 'pendiente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateTransferStatus(transfer.id, 'aprobado')}
                              disabled={updating === transfer.id}
                              className="bg-green-600 hover:bg-green-700 touch-target"
                            >
                              {updating === transfer.id ? 'Actualizando...' : 'Aprobar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateTransferStatus(transfer.id, 'rechazado')}
                              disabled={updating === transfer.id}
                              className="touch-target"
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        {transfer.status === 'aprobado' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTransferStatus(transfer.id, 'pendiente')}
                              disabled={updating === transfer.id}
                              className="touch-target"
                            >
                              Marcar como Pendiente
                            </Button>
                            {transfer.assigned_numbers && transfer.assigned_numbers.length > 0 && (
                              <Button
                                size="sm"
                                onClick={() => sendWhatsAppNumbers(transfer)}
                                className="bg-green-600 hover:bg-green-700 touch-target flex items-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Enviar Boletos por WhatsApp
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Cliente
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Nombre:</strong> {transfer.nombre}</p>
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {transfer.email}
                          </p>
                          {transfer.telefono && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {transfer.telefono}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Pago
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Monto:</strong> ${transfer.monto_pagado}</p>
                          {transfer.numero_referencia && (
                            <p><strong>Referencia:</strong> {transfer.numero_referencia}</p>
                          )}
                          {transfer.quantity && (
                            <p><strong>Boletos:</strong> {transfer.quantity}</p>
                          )}
                          <p><strong>Rifa:</strong> {getRaffleName(transfer.raffle_id)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Comprobante & Números
                        </h4>
                        <div className="text-sm">
                          {transfer.comprobante_url ? (
                            <a 
                              href={transfer.comprobante_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Ver comprobante
                            </a>
                          ) : (
                            <p className="text-muted-foreground">Sin comprobante adjunto</p>
                          )}
                          {transfer.assigned_numbers && transfer.assigned_numbers.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium mb-1">Números asignados:</p>
                              <div className="flex flex-wrap gap-1">
                                {transfer.assigned_numbers.map(num => (
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminConfirmations;
