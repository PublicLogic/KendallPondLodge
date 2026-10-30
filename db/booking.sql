-- Run once in a dedicated Supabase project before enabling /book.
-- Only server-side code holds the service role key. No guest data is readable by anon.
create extension if not exists btree_gist;

create table if not exists public.kpl_booking_requests (
  id uuid primary key default gen_random_uuid(),
  quote_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  check_in date not null,
  check_out date not null,
  guest_name text not null,
  guest_email text not null,
  guests integer not null check (guests between 1 and 8),
  pets integer not null check (pets between 0 and 2),
  note text not null default '',
  status text not null default 'requested' check (status in ('requested','quoted','checkout','confirmed','expired','declined')),
  nightly_cents integer,
  cleaning_cents integer,
  pet_cents integer,
  tax_cents integer,
  other_cents integer,
  other_label text,
  deposit_cents integer,
  total_cents integer,
  cancellation_terms text,
  balance_terms text,
  quote_expires timestamptz,
  stripe_session_id text unique,
  accepted_at timestamptz,
  checkout_started_at timestamptz,
  paid_at timestamptz,
  check (check_out > check_in and check_out <= check_in + 30),
  check (status not in ('quoted','checkout','confirmed') or
    (coalesce(nightly_cents, 0) > 0 and coalesce(cleaning_cents, -1) >= 0 and
     coalesce(pet_cents, -1) >= 0 and coalesce(tax_cents, -1) >= 0 and
     coalesce(other_cents, -1) >= 0 and coalesce(deposit_cents, 0) > 0 and
     coalesce(total_cents, -1) >= deposit_cents and
     coalesce(total_cents, -1) = (check_out - check_in) * nightly_cents + cleaning_cents + pet_cents + tax_cents + other_cents and
     length(coalesce(cancellation_terms, '')) >= 20 and length(coalesce(balance_terms, '')) >= 20 and
     coalesce(quote_expires > created_at, false))),
  constraint no_overlapping_active_kpl_stays
    exclude using gist (daterange(check_in, check_out, '[)') with &&)
    where (status in ('quoted','checkout','confirmed'))
);

alter table public.kpl_booking_requests enable row level security;
-- Re-running this script on a test database updates the earlier eight-pet limit.
alter table public.kpl_booking_requests drop constraint if exists kpl_booking_requests_pets_check;
alter table public.kpl_booking_requests add constraint kpl_booking_requests_pets_check check (pets between 0 and 2);
revoke all on public.kpl_booking_requests from anon, authenticated;
grant all on public.kpl_booking_requests to service_role;

create or replace function public.kpl_issue_quote(
  p_id uuid, p_nightly integer, p_cleaning integer, p_pet integer,
  p_tax integer, p_other integer, p_other_label text,
  p_deposit integer, p_total integer, p_cancellation text,
  p_balance text, p_expires timestamptz
) returns uuid language plpgsql security invoker set search_path = public as $$
declare v_token uuid;
begin
  -- A quoted hold only expires before a Checkout session is created.
  update public.kpl_booking_requests set status = 'expired'
    where status = 'quoted' and quote_expires < now() and stripe_session_id is null;
  update public.kpl_booking_requests set
    status = 'quoted', nightly_cents = p_nightly, cleaning_cents = p_cleaning,
    pet_cents = p_pet, tax_cents = p_tax, other_cents = p_other,
    other_label = p_other_label, deposit_cents = p_deposit,
    total_cents = p_total, cancellation_terms = p_cancellation,
    balance_terms = p_balance, quote_expires = p_expires
    where id = p_id and status = 'requested'
    returning quote_token into v_token;
  if v_token is null then raise exception 'Request is no longer open'; end if;
  return v_token;
end $$;

create or replace function public.kpl_begin_checkout(p_token uuid)
returns setof public.kpl_booking_requests language plpgsql security invoker set search_path = public as $$
begin
  update public.kpl_booking_requests set accepted_at = coalesce(accepted_at, now()),
    checkout_started_at = coalesce(checkout_started_at, now()), status = 'checkout'
  where quote_token = p_token and status in ('quoted','checkout')
    and quote_expires > now() + interval '65 minutes';
  return query select * from public.kpl_booking_requests
    where quote_token = p_token and status in ('quoted','checkout')
      and quote_expires > now() + interval '65 minutes';
end $$;

create or replace function public.kpl_release_quote(p_id uuid)
returns boolean language plpgsql security invoker set search_path = public as $$
declare v_id uuid;
begin
  update public.kpl_booking_requests set status = 'expired'
    where id = p_id and
      ((status = 'quoted' and stripe_session_id is null) or
       (status = 'checkout' and stripe_session_id is null and checkout_started_at < now() - interval '1 hour') or
       (status = 'checkout' and stripe_session_id is not null))
    returning id into v_id;
  return v_id is not null;
end $$;

create or replace function public.kpl_attach_checkout(p_id uuid, p_session text)
returns boolean language plpgsql security invoker set search_path = public as $$
declare v_id uuid;
begin
  update public.kpl_booking_requests
    set stripe_session_id = p_session,
        status = case when status = 'confirmed' then status else 'checkout' end
    where id = p_id and status in ('quoted','checkout','confirmed')
      and (stripe_session_id is null or stripe_session_id = p_session)
    returning id into v_id;
  return v_id is not null;
end $$;

create or replace function public.kpl_confirm_payment(p_id uuid, p_session text, p_amount integer)
returns boolean language plpgsql security invoker set search_path = public as $$
declare v_id uuid;
begin
  update public.kpl_booking_requests
    set status = 'confirmed', stripe_session_id = p_session, paid_at = coalesce(paid_at, now())
    where id = p_id and status in ('quoted','checkout','confirmed')
      and accepted_at is not null and deposit_cents = p_amount
      and (stripe_session_id is null or stripe_session_id = p_session)
    returning id into v_id;
  return v_id is not null;
end $$;

revoke all on function public.kpl_issue_quote(uuid,integer,integer,integer,integer,integer,text,integer,integer,text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.kpl_begin_checkout(uuid) from public, anon, authenticated;
revoke all on function public.kpl_attach_checkout(uuid,text) from public, anon, authenticated;
revoke all on function public.kpl_confirm_payment(uuid,text,integer) from public, anon, authenticated;
revoke all on function public.kpl_release_quote(uuid) from public, anon, authenticated;
grant execute on function public.kpl_issue_quote(uuid,integer,integer,integer,integer,integer,text,integer,integer,text,text,timestamptz) to service_role;
grant execute on function public.kpl_begin_checkout(uuid) to service_role;
grant execute on function public.kpl_attach_checkout(uuid,text) to service_role;
grant execute on function public.kpl_confirm_payment(uuid,text,integer) to service_role;
grant execute on function public.kpl_release_quote(uuid) to service_role;
