import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PayPalWidgetProps {
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  minAmount?: number;
  currency?: string;
  clientId?: string;
}

const PayPalWidget = ({ 
  onSuccess, 
  onError, 
  onCancel,
  minAmount = 1.00,
  currency = 'USD',
  clientId = 'AcThy7S3bmb6CLJVF9IhV0xsbEkrXmYm-rilgJHnf3t4XVE_3zQrtHSW_tudJvXPlZEE912X9tlsR624'
}: PayPalWidgetProps) => {
  const cardButtonRef = useRef<HTMLDivElement>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const refRef = useRef<HTMLInputElement>(null);
  const okMsgRef = useRef<HTMLDivElement>(null);
  const errMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons&enable-funding=card`;
    script.async = true;
    
    script.onload = () => {
      initializePayPal();
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [clientId, currency]);

  const normalizeAmount = () => {
    if (!amountRef.current) return;
    let v = parseFloat((amountRef.current.value || '0').toString().replace(',', '.'));
    if (isNaN(v) || v < minAmount) v = minAmount;
    amountRef.current.value = v.toFixed(2);
  };

  const getAmount = () => {
    if (!amountRef.current) return minAmount.toFixed(2);
    const v = parseFloat((amountRef.current.value || '0').toString().replace(',', '.'));
    return (isNaN(v) || v < minAmount) ? minAmount.toFixed(2) : v.toFixed(2);
  };

  const getDesc = () => {
    const base = 'Pago Colectivo Tómbola';
    const ref = refRef.current?.value?.trim() || '';
    return ref ? `${base} – ${ref}` : base;
  };

  const show = (el: HTMLElement | null) => {
    if (el) el.style.display = 'block';
  };

  const hide = (el: HTMLElement | null) => {
    if (el) el.style.display = 'none';
  };

  const initializePayPal = () => {
    if (!(window as any).paypal) return;

    const commonConfig = {
      style: { layout: 'vertical', shape: 'rect', label: 'paypal' },
      createOrder: (data: any, actions: any) => actions.order.create({
        purchase_units: [{
          amount: { value: getAmount(), currency_code: currency },
          description: getDesc()
        }]
      }),
      onApprove: (data: any, actions: any) =>
        actions.order.capture().then((details: any) => {
          hide(errMsgRef.current);
          if (okMsgRef.current) {
            okMsgRef.current.textContent = `✅ Gracias por su pago. ID: ${details?.id || ''}`;
            show(okMsgRef.current);
          }
          onSuccess?.(details);
        }),
      onCancel: () => {
        alert('⛔ Pago cancelado.');
        onCancel?.();
      },
      onError: (err: any) => {
        console.error('Error PayPal:', err);
        hide(okMsgRef.current);
        show(errMsgRef.current);
        onError?.(err);
      }
    };

    // Card button
    const cardBtn = (window as any).paypal.Buttons({ 
      fundingSource: (window as any).paypal.FUNDING.CARD, 
      ...commonConfig 
    });
    if (cardBtn.isEligible() && cardButtonRef.current) {
      cardBtn.render(cardButtonRef.current);
    }

    // PayPal button
    const ppBtn = (window as any).paypal.Buttons({ 
      fundingSource: (window as any).paypal.FUNDING.PAYPAL, 
      ...commonConfig 
    });
    if (ppBtn.isEligible() && paypalButtonRef.current) {
      ppBtn.render(paypalButtonRef.current);
    }
  };

  return (
    <Card className="max-w-xl mx-auto p-6 border border-border rounded-2xl bg-card shadow-lg">
      <h3 className="text-xl font-semibold mb-2 text-foreground">Realizar pago</h3>
      <p className="text-muted-foreground mb-4">
        Paga con <strong>Tarjeta</strong> o <strong>PayPal</strong>. Mínimo <strong>${minAmount.toFixed(2)}</strong>.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="monto" className="font-semibold">
            Monto ({currency})
          </Label>
          <Input
            ref={amountRef}
            id="monto"
            type="number"
            min={minAmount}
            step="0.01"
            defaultValue={minAmount.toFixed(2)}
            className="mt-1"
            onChange={normalizeAmount}
            onBlur={normalizeAmount}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Mínimo: ${minAmount.toFixed(2)}
          </p>
        </div>

        <div>
          <Label htmlFor="ref" className="font-semibold">
            Referencia (opcional)
          </Label>
          <Input
            ref={refRef}
            id="ref"
            type="text"
            placeholder="Ej: Rifa #123"
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Se mostrará en la descripción del pago.
          </p>
        </div>
      </div>

      <hr className="my-4 border-border" />

      {/* Payment Buttons */}
      <div ref={cardButtonRef} className="mb-3"></div>
      <div ref={paypalButtonRef}></div>

      {/* Messages */}
      <div 
        ref={okMsgRef}
        style={{ display: 'none' }}
        className="mt-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-800 font-semibold"
      >
        ✅ Gracias por su pago.
      </div>
      <div 
        ref={errMsgRef}
        style={{ display: 'none' }}
        className="mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 font-semibold"
      >
        ⚠️ Ocurrió un problema. Intente de nuevo.
      </div>
    </Card>
  );
};

export default PayPalWidget;