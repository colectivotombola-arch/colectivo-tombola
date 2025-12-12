import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PagoTransferencia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    monto_pagado: '',
    numero_referencia: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!formData.monto_pagado.trim() || parseFloat(formData.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'El monto debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('transferencias')
        .insert({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          monto_pagado: parseFloat(formData.monto_pagado),
          numero_referencia: formData.numero_referencia.trim() || null
        });
      
      if (error) throw error;
      
      setSubmitted(true);
      toast({
        title: "Comprobante enviado",
        description: "Tu comprobante ha sido registrado correctamente",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el comprobante. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">¡Comprobante Enviado!</h2>
            <p className="text-muted-foreground text-sm">
              Hemos recibido tu comprobante de transferencia. Te contactaremos pronto para confirmar tu compra y asignarte tus números.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link to="/comprar">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-foreground">Pago por Transferencia</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Datos bancarios */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Datos Bancarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground mb-3">
              Realiza la transferencia por el monto total de tu compra y envíanos tu comprobante.
            </p>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banco:</span>
                <span className="font-medium">NOMBRE DEL BANCO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de cuenta:</span>
                <span className="font-medium">AHORROS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número de cuenta:</span>
                <span className="font-medium">0000000000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Titular:</span>
                <span className="font-medium">NOMBRE DEL TITULAR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Enviar Comprobante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="nombre" className="text-sm">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className="h-9"
                />
                {errors.nombre && <p className="text-destructive text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Correo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  className="h-9"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="monto_pagado" className="text-sm">Monto Pagado *</Label>
                <Input
                  id="monto_pagado"
                  type="number"
                  step="0.01"
                  value={formData.monto_pagado}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto_pagado: e.target.value }))}
                  placeholder="0.00"
                  className="h-9"
                />
                {errors.monto_pagado && <p className="text-destructive text-xs mt-1">{errors.monto_pagado}</p>}
              </div>

              <div>
                <Label htmlFor="numero_referencia" className="text-sm">Número de Referencia</Label>
                <Input
                  id="numero_referencia"
                  value={formData.numero_referencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero_referencia: e.target.value }))}
                  placeholder="Número de referencia o descripción"
                  className="h-9"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Comprobante'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PagoTransferencia;
