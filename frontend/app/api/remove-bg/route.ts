import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;
    const theme = formData.get('theme') as string;
    const name = formData.get('name') as string || 'Unnamed Item';

    if (!file || !type || !theme) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Send image to remove.bg API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const removeBgForm = new FormData();
    removeBgForm.append('image_file', new Blob([buffer], { type: file.type }), file.name);
    removeBgForm.append('size', 'auto');

    const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
    if (!removeBgApiKey) {
      return NextResponse.json({ error: 'Remove.bg API key not configured' }, { status: 500 });
    }

    let processedBuffer: Buffer;
    try {
      const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': removeBgApiKey,
        },
        body: removeBgForm,
      });

      if (!removeBgResponse.ok) {
        const errorBody = await removeBgResponse.text();
        console.error('remove.bg API error:', removeBgResponse.status, errorBody);
        return NextResponse.json(
          { error: `Background removal failed: ${removeBgResponse.statusText}` }, 
          { status: 500 }
        );
      }

      const processedArrayBuffer = await removeBgResponse.arrayBuffer();
      processedBuffer = Buffer.from(processedArrayBuffer);
    } catch (bgError) {
      console.error('remove.bg request failed:', bgError);
      return NextResponse.json({ error: 'Failed to process image background' }, { status: 500 });
    }

    // 2. Upload to Supabase Storage
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'png';
    const originalPath = `${userId}/${timestamp}_original.${ext}`;
    const processedPath = `${userId}/${timestamp}_processed.png`;

    const { error: originalUploadError } = await supabase.storage
      .from('clothing-originals')
      .upload(originalPath, buffer, {
        contentType: file.type,
      });

    if (originalUploadError) {
      console.error('Original upload error:', originalUploadError);
      return NextResponse.json({ error: 'Failed to upload original image' }, { status: 500 });
    }

    const { error: processedUploadError } = await supabase.storage
      .from('clothing-processed')
      .upload(processedPath, processedBuffer, {
        contentType: 'image/png',
      });

    if (processedUploadError) {
      console.error('Processed upload error:', processedUploadError);
      return NextResponse.json({ error: 'Failed to upload processed image' }, { status: 500 });
    }

    const { data: originalUrlData } = supabase.storage
      .from('clothing-originals')
      .getPublicUrl(originalPath);
      
    const { data: processedUrlData } = supabase.storage
      .from('clothing-processed')
      .getPublicUrl(processedPath);

    // 3. Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('clothing_items')
      .insert({
        user_id: userId,
        name,
        type,
        theme,
        original_image_url: originalUrlData.publicUrl,
        processed_image_url: processedUrlData.publicUrl,
        original_storage_path: originalPath,
        processed_storage_path: processedPath,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save item to database' }, { status: 500 });
    }

    return NextResponse.json({ data: dbData });

  } catch (error) {
    console.error('Upload handler error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
