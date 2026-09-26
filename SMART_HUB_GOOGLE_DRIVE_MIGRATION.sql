-- SMART HUB: Google Drive becomes the actual file storage.
-- Supabase stores metadata + Drive file ID/URL only.

alter table public.resources
  add column if not exists drive_file_id text;

create index if not exists resources_drive_file_id_idx
  on public.resources(drive_file_id);

-- The old Supabase Storage bucket can remain for now while existing files are migrated.
-- New Admin Dashboard uploads no longer use it.
