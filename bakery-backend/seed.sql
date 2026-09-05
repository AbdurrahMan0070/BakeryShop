INSERT INTO "Category" (name) VALUES
  ('Bread'),
  ('Cakes'),
  ('Pastries'),
  ('Cookies'),
  ('Beverages'),
  ('Savory')
ON CONFLICT (name) DO NOTHING;
