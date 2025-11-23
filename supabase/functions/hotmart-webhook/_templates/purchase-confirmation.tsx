import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PurchaseConfirmationEmailProps {
  buyerName: string;
  raffleTitle: string;
  assignedNumbers: number[];
  confirmationNumber: string;
  quantity: number;
  totalAmount: number;
}

export const PurchaseConfirmationEmail = ({
  buyerName,
  raffleTitle,
  assignedNumbers,
  confirmationNumber,
  quantity,
  totalAmount,
}: PurchaseConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Tu compra ha sido confirmada! Números asignados para {raffleTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Pago Confirmado! 🎉</Heading>
        
        <Text style={text}>Hola {buyerName},</Text>
        
        <Text style={text}>
          Tu pago ha sido procesado exitosamente a través de Hotmart. Tus números para la rifa han sido asignados.
        </Text>

        <Section style={infoSection}>
          <Text style={infoLabel}>Rifa:</Text>
          <Text style={infoValue}>{raffleTitle}</Text>
          
          <Text style={infoLabel}>Cantidad de números:</Text>
          <Text style={infoValue}>{quantity}</Text>
          
          <Text style={infoLabel}>Total pagado:</Text>
          <Text style={infoValue}>${totalAmount.toFixed(2)}</Text>
          
          <Text style={infoLabel}>Número de confirmación:</Text>
          <Text style={infoValue}>{confirmationNumber}</Text>
        </Section>

        <Hr style={hr} />

        <Heading style={h2}>Tus números asignados:</Heading>
        
        <Section style={numbersSection}>
          {assignedNumbers.map((num, index) => (
            <Text key={index} style={numberBadge}>{num}</Text>
          ))}
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Importante:</strong> Guarda este correo como comprobante de tu compra. 
          Puedes consultar tus números en cualquier momento usando tu número de teléfono.
        </Text>

        <Text style={footer}>
          ¡Mucha suerte en el sorteo! 🍀
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PurchaseConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.3',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 40px 20px',
  padding: '0',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
};

const infoSection = {
  padding: '24px 40px',
  backgroundColor: '#f8f9fa',
  margin: '20px 0',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  margin: '12px 0 4px',
};

const infoValue = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const numbersSection = {
  padding: '20px 40px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const numberBadge = {
  display: 'inline-block',
  padding: '8px 16px',
  backgroundColor: '#00e5cc',
  color: '#1a1a1a',
  borderRadius: '6px',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '4px',
  minWidth: '60px',
  textAlign: 'center',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  padding: '0 40px',
};
