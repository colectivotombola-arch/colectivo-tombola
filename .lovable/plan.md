# Auditoría del sistema Colectivo Tómbola

Este es un reporte de estado. **No se aplicaron cambios.** Al final propongo qué correcciones se harían al pasar a modo build, en orden de prioridad.

## 1. Métodos de pago

### PayPal
- **Entorno: LIVE (producción).** `VITE_PAYPAL_ENVIRONMENT="live"` y `VITE_PAYPAL_CLIENT_ID` configurados en `.env` (Client ID `AYTM22fKDL...`).
- SDK se carga dinámicamente en `PurchasePayPal.tsx` con `intent=capture`, `currency=USD`, botones amarillo (PayPal) + negro (tarjeta / guest checkout). Limpieza de scripts y refs implementada correctamente.
- Edge function `process-paypal-purchase` existe y está con `verify_jwt = false`.
- **End-to-end no verificado con datos reales:** `purchase_confirmations` tiene **0 filas** y no hay logs recientes de `process-paypal-purchase`. Es decir, la infraestructura está lista pero **nadie ha completado una compra PayPal aún** (o no ha llegado a insertar). Habría que hacer una compra de prueba mínima para confirmar el flujo real.

### Transferencia bancaria
- Bucket `uploads` **existe y es público** ✅.
- Página `/pago-transferencia` inserta en tabla `transferencias`, y tiene RLS correcta (INSERT público, SELECT/UPDATE/DELETE solo admin).
- **⚠️ Datos bancarios NO configurados en `site_settings`:** `bank_name`, `bank_account_holder`, `bank_account_number` están en `NULL`. La página de transferencia se muestra vacía o incompleta al comprador. Este es el bloqueador #1 para transferencia bancaria.
- `transferencias` tiene **0 filas** — tampoco se ha probado una transferencia real end-to-end.

## 2. RESEND_API_KEY y emails

- `RESEND_API_KEY` está **configurada como secret** ✅.
- Edge functions `send-purchase-confirmation` y `send-purchase-email` existen.
- **No hay logs** en `send-purchase-confirmation` — no se ha disparado nunca en producción reciente. No podemos afirmar que "funciona"; solo que está lista. Requiere una compra real (PayPal o transferencia aprobada) para verificar entrega.
- Riesgo típico: el `from:` debe usar un dominio verificado en Resend; si aún usa `onboarding@resend.dev` solo entregará al dueño de la cuenta. Habría que revisar el `from` en el código de la función.

## 3. Tareas del historial reciente — estado

| Tarea del historial | Estado observado |
|---|---|
| Redes sociales en footer (FB/IG/TikTok) | URLs guardadas en `social_media` ✅ |
| Datos bancarios reales en Admin > Settings | **Falta** — columnas NULL ❌ |
| RESEND config | Secret puesto, entrega sin validar ⚠️ |
| Aprobación transferencia → asigna números + WhatsApp | Código presente, sin datos que lo prueben (0 transferencias) ⚠️ |
| `assigned_numbers` guardado en tabla `transferencias` | Columna existe, sin filas para verificar ⚠️ |
| Botón "Reiniciar Sorteo" limitado a raffle_numbers/transferencias/purchase_confirmations | Requiere revisión de código de admin (no verificado en esta pasada) |
| `contact_email` para formularios | **NULL en DB** ❌ |

## 4. Errores / logs

- Console logs del preview: sin errores capturados en el snapshot actual.
- Sin logs recientes en `process-paypal-purchase` ni `send-purchase-confirmation` (nunca invocadas o TTL vencido).
- No hay señales de fallos de build en el contexto.

## 5. Flujo de asignación de números

- **PayPal:** `process-paypal-purchase` (service_role) es responsable de generar números e insertarlos en `raffle_numbers` + `purchase_confirmations`. Sin ejecuciones reales aún, no se puede confirmar 100%. Requiere prueba controlada.
- **Transferencias:** al aprobar en `AdminConfirmations`, el frontend usa `generateRandomNumbers` y guarda en `purchase_confirmations` y `transferencias.assigned_numbers`. Lógica presente; sin datos reales que la validen.

## 6. RLS — hallazgos

### `purchase_confirmations`
- **Políticas duplicadas** (no rompen, pero ensucian):
  - DELETE: "Only admins can delete confirmations" (authenticated) + "Only admins delete confirmations" (public) — dos políticas del mismo tipo.
  - UPDATE: mismo caso, duplicada para authenticated y para public.
- Todas son PERMISSIVE, hay al menos una de cada CRUD → **funcional**.

### `raffle_numbers`
- INSERT solo para `authenticated`; SELECT solo para `authenticated` (por email); ALL para admin.
- **Compradores invitados (anon) no pueden insertar directamente**, pero eso es correcto porque la inserción la hace la edge function con `service_role` (bypass RLS). ✅
- **Efecto colateral:** un comprador invitado no puede consultar sus propios números vía el cliente porque el SELECT exige `authenticated`. La página "Consultar números" solo funcionará si el usuario está logueado o si se consulta vía edge function.

### `transferencias`
- INSERT público, SELECT/UPDATE/DELETE solo admin. Correcto ✅.

**Ninguna tabla tiene solo políticas restrictive sin permissive.** No hay bloqueo de acceso por mala combinación.

## 7. Panel de Admin

- Componentes presentes: `AdminSettings`, `AdminConfirmations`, `AdminRaffles`, `AdminPackages`, `AdminDesign`, `AdminGallery`, `AdminMediaGallery`, `AdminInstantPrizes`, `AdminPhotoGallery`, `AdminPrizeDisplays`, `AdminSoldNumbers`, `AdminWinners`, `AdminDashboard`.
- `update-site-settings` valida rol admin correctamente ✅.
- Falta verificar en UI que existan campos para: datos bancarios, `contact_email` (dado que ambos están NULL en DB, o el admin no los ha llenado, o el formulario no los expone). Requiere abrir `AdminSettings.tsx` para confirmar.

## 8. Otros gaps para producción real

1. **Datos bancarios NULL** → transferencia no usable.
2. **`contact_email` NULL** → formularios de contacto sin destino.
3. **Sender de Resend** puede estar en `onboarding@resend.dev` → entrega solo al owner. Requiere dominio verificado en Resend + actualizar `from`.
4. **Ninguna compra real ejecutada** → PayPal + emails + asignación de números no probados end-to-end.
5. **Consulta de números para invitados** bloqueada por RLS de `raffle_numbers` (SELECT solo authenticated). Si "Consultar mis números" es una función pública, necesita un RPC security-definer o edge function.
6. **Políticas duplicadas en `purchase_confirmations`** — limpieza recomendada.
7. `hotmart-webhook` está deployado con `verify_jwt=false` — si ya no se usa Hotmart, eliminarlo reduce superficie.

---

## Correcciones propuestas (al aprobar build)

Orden sugerido de prioridad, todo son cambios pequeños:

1. Rellenar en Admin > Settings los datos bancarios y `contact_email` (acción del usuario, no código). Verificar en `AdminSettings.tsx` que los campos existan y guarden a `payment_settings` + `contact_email`.
2. Revisar `send-purchase-confirmation` y confirmar `from:` — si usa `onboarding@resend.dev`, documentar que solo el dueño recibirá; recomendar dominio verificado.
3. Ejecutar una compra de prueba PayPal de monto mínimo para validar: captura → `process-paypal-purchase` → `raffle_numbers` + `purchase_confirmations` → email Resend.
4. Ejecutar una transferencia de prueba → aprobar en Admin → verificar `assigned_numbers` + link de WhatsApp.
5. Limpiar políticas duplicadas de `purchase_confirmations` (migración).
6. Si "Consultar números" debe ser público para invitados, exponerlo vía RPC security-definer que filtra por `buyer_email` + código de confirmación.
7. Opcional: eliminar `hotmart-webhook` y su config si Hotmart ya no se usa.

Confirma con cuál quieres empezar y paso a modo build.
