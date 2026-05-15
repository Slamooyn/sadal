-- ============================================================
-- Fix RLS policies so Explore page can show images from all users
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. clothing_items — allow public read (images are in public buckets anyway)
DROP POLICY IF EXISTS "Users can view own clothing items" ON public.clothing_items;
DROP POLICY IF EXISTS "Public read access for clothing items" ON public.clothing_items;

CREATE POLICY "Public read access for clothing items"
ON public.clothing_items FOR SELECT
USING (true);

-- Keep insert/update/delete restricted to owner
DROP POLICY IF EXISTS "Users can insert own clothing items" ON public.clothing_items;
CREATE POLICY "Users can insert own clothing items"
ON public.clothing_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clothing items" ON public.clothing_items;
CREATE POLICY "Users can update own clothing items"
ON public.clothing_items FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clothing items" ON public.clothing_items;
CREATE POLICY "Users can delete own clothing items"
ON public.clothing_items FOR DELETE
USING (auth.uid() = user_id);


-- 2. outfit_sets — allow public read
DROP POLICY IF EXISTS "Users can view own outfit sets" ON public.outfit_sets;
DROP POLICY IF EXISTS "Public read access for outfit sets" ON public.outfit_sets;

CREATE POLICY "Public read access for outfit sets"
ON public.outfit_sets FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert own outfit sets" ON public.outfit_sets;
CREATE POLICY "Users can insert own outfit sets"
ON public.outfit_sets FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own outfit sets" ON public.outfit_sets;
CREATE POLICY "Users can update own outfit sets"
ON public.outfit_sets FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own outfit sets" ON public.outfit_sets;
CREATE POLICY "Users can delete own outfit sets"
ON public.outfit_sets FOR DELETE
USING (auth.uid() = user_id);


-- 3. outfit_set_items — allow public read
DROP POLICY IF EXISTS "Users can view own outfit set items" ON public.outfit_set_items;
DROP POLICY IF EXISTS "Public read access for outfit set items" ON public.outfit_set_items;

CREATE POLICY "Public read access for outfit set items"
ON public.outfit_set_items FOR SELECT
USING (true);

-- outfit_set_items might not have user_id directly,
-- so insert/update/delete should be based on the parent outfit_set ownership.
-- If it has user_id column:
DROP POLICY IF EXISTS "Users can insert own outfit set items" ON public.outfit_set_items;
CREATE POLICY "Users can manage own outfit set items"
ON public.outfit_set_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.outfit_sets
    WHERE outfit_sets.id = outfit_set_items.outfit_set_id
    AND outfit_sets.user_id = auth.uid()
  )
);


-- 4. wardrobe_posts — allow public read (already might work, but ensure it)
DROP POLICY IF EXISTS "Public read access for wardrobe posts" ON public.wardrobe_posts;

CREATE POLICY "Public read access for wardrobe posts"
ON public.wardrobe_posts FOR SELECT
USING (true);


-- 5. wardrobes — allow public read for public wardrobes
DROP POLICY IF EXISTS "Public wardrobes are viewable" ON public.wardrobes;

CREATE POLICY "Public wardrobes are viewable"
ON public.wardrobes FOR SELECT
USING (is_public = true OR auth.uid() = user_id);


-- 6. profiles — allow public read (for usernames in explore)
DROP POLICY IF EXISTS "Public read access for profiles" ON public.profiles;

CREATE POLICY "Public read access for profiles"
ON public.profiles FOR SELECT
USING (true);


-- 7. saved_posts — only user can see their own saves
DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts;

CREATE POLICY "Users can view own saved posts"
ON public.saved_posts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved posts" ON public.saved_posts;
CREATE POLICY "Users can insert own saved posts"
ON public.saved_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved posts" ON public.saved_posts;
CREATE POLICY "Users can delete own saved posts"
ON public.saved_posts FOR DELETE
USING (auth.uid() = user_id);


-- ============================================================
-- MAKE SURE RLS IS ENABLED on all tables
-- (If RLS is disabled, policies are ignored and everything is open)
-- ============================================================
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
