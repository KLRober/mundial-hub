-- Función RPC para sumar puntos de minijuegos
-- El usuario autenticado solo puede modificar sus propios puntos
create or replace function add_game_points(points_to_add integer)
returns void as $$
begin
  -- Validar que los puntos sean positivos
  if points_to_add <= 0 then
    raise exception 'Points must be positive';
  end if;
  
  update profiles
  set puntos_totales = coalesce(puntos_totales, 0) + points_to_add,
      updated_at = now()
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Otorgar permisos para ejecutar la función a usuarios autenticados
grant execute on function add_game_points(integer) to authenticated;
