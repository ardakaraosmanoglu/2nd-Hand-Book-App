-- Create a public Storage bucket for book images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-images', 'Book Images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Storage policies for the book-images bucket
-- Allow anyone to read images (since they're public)
CREATE POLICY "Public can view book images"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload book images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own book images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own book images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
); 