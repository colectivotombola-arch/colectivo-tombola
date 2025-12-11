-- Eliminar paquetes existentes para la rifa activa
DELETE FROM raffle_packages WHERE raffle_id = '5c67cd35-bf39-4735-8862-a028aa36eff8';

-- Insertar nuevos paquetes predeterminados
INSERT INTO raffle_packages (raffle_id, ticket_count, price_per_ticket, is_popular, display_order) VALUES
('5c67cd35-bf39-4735-8862-a028aa36eff8', 6, 1.50, false, 1),
('5c67cd35-bf39-4735-8862-a028aa36eff8', 10, 1.50, false, 2),
('5c67cd35-bf39-4735-8862-a028aa36eff8', 20, 1.50, true, 3),
('5c67cd35-bf39-4735-8862-a028aa36eff8', 30, 1.50, false, 4),
('5c67cd35-bf39-4735-8862-a028aa36eff8', 50, 1.50, false, 5),
('5c67cd35-bf39-4735-8862-a028aa36eff8', 100, 1.50, false, 6);