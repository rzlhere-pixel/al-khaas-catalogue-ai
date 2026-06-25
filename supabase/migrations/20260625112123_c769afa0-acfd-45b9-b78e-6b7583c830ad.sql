
CREATE TABLE public.product_images (
  product_id text PRIMARY KEY,
  image_url text,
  confidence numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  reasoning text,
  source text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read product images" ON public.product_images
  FOR SELECT TO anon, authenticated USING (true);
