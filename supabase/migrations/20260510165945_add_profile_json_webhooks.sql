drop trigger if exists members_generate_profile_json_webhook on public.members;
create trigger members_generate_profile_json_webhook
after insert or update
on public.members
for each row
execute function supabase_functions.http_request(
  'https://imeppcpuwibvvyxmhiwo.supabase.co/functions/v1/generate-profile-json',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);

drop trigger if exists accounts_generate_profile_json_webhook on public.accounts;
create trigger accounts_generate_profile_json_webhook
after insert or update or delete
on public.accounts
for each row
execute function supabase_functions.http_request(
  'https://imeppcpuwibvvyxmhiwo.supabase.co/functions/v1/generate-profile-json',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);

drop trigger if exists member_domains_generate_profile_json_webhook on public.member_domains;
create trigger member_domains_generate_profile_json_webhook
after insert or update or delete
on public.member_domains
for each row
execute function supabase_functions.http_request(
  'https://imeppcpuwibvvyxmhiwo.supabase.co/functions/v1/generate-profile-json',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);
