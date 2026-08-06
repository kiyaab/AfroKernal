-- Course materials bucket: PDFs and note attachments for lessons

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  26214400,
  ARRAY[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Course materials are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-materials');

CREATE POLICY "Authenticated users can upload course materials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "Authenticated users can update course materials"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'course-materials');

CREATE POLICY "Authenticated users can delete course materials"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'course-materials');
