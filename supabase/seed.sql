-- Insert mock matches for Mundial 2026 (Group Stage)
-- Note: 'venue' and 'city' are placeholders for 2026 hosts

insert into matches (equipo_local, equipo_visitante, fecha, venue, city, group_name, estado)
values
  -- June 11, 2026 (Opening Match)
  ('México', 'Estados Unidos', '2026-06-11 16:00:00+00', 'Estadio Azteca', 'Ciudad de México', 'A', 'scheduled'),
  
  -- June 12, 2026
  ('Argentina', 'España', '2026-06-12 13:00:00+00', 'MetLife Stadium', 'Nueva Jersey', 'B', 'scheduled'),
  ('Brasil', 'Francia', '2026-06-12 19:00:00+00', 'SoFi Stadium', 'Los Ángeles', 'C', 'scheduled'),
  
  -- June 13, 2026
  ('Alemania', 'Inglaterra', '2026-06-13 14:00:00+00', 'AT&T Stadium', 'Dallas', 'D', 'scheduled'),
  ('Uruguay', 'Portugal', '2026-06-13 17:00:00+00', 'Hard Rock Stadium', 'Miami', 'E', 'scheduled');
