import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_PDF_UPLOAD_WEBHOOK_URL!;
const FILE_UPLOAD_SUPABASE_URL = process.env.NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_URL!;
const FILE_UPLOAD_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_ANON_KEY!;

if (!WEBHOOK_URL) {
  throw new Error('WEBHOOK_URL is not set');
}

if (!FILE_UPLOAD_SUPABASE_URL || !FILE_UPLOAD_SUPABASE_ANON_KEY) {
  throw new Error('File upload Supabase credentials are not set');
}

// Create Supabase client for server-side use (for file upload checks)
const supabase = createClient(FILE_UPLOAD_SUPABASE_URL, FILE_UPLOAD_SUPABASE_ANON_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Check if file_name already exists in institution table
    const fileName = file.name;
    const { data: existingFiles, error: checkError } = await supabase
      .from('institution')
      .select('file_name')
      .eq('file_name', fileName)
      .limit(1);

    if (checkError) {
      console.error('Error checking file existence:', checkError);
      // Continue with upload even if check fails (don't block upload due to DB error)
    } else if (existingFiles && existingFiles.length > 0) {
      return NextResponse.json(
        { 
          error: 'This PDF has already been processed',
          message: `The file "${fileName}" already exists in the system. Please upload a different file.`
        },
        { status: 409 } // 409 Conflict status code
      );
    }

    // Create a new FormData to forward to the webhook
    const webhookFormData = new FormData();
    webhookFormData.append('data', file, file.name);

    // Forward the file to the webhook via POST request
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: webhookFormData,
      // Don't set Content-Type header - let fetch set it automatically with boundary for FormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Webhook error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const responseData = await response.text();
    
    return NextResponse.json(
      { success: true, message: 'PDF uploaded successfully', data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

