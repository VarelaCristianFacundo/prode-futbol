-- Allow users to submit predictions for pending rounds too
-- (still respecting 20-minute cutoff before kickoff).

create or replace function public.can_submit_prediction(p_match_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    join public.rounds r on r.round_number = m.round_number
    where m.id = p_match_id
      and r.status in ('pending', 'open')
      and now() < (m.match_date - interval '20 minutes')
  );
$$;

grant execute on function public.can_submit_prediction(bigint) to authenticated;
