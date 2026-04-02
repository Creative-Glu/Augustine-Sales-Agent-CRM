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

const supabase = createClient(FILE_UPLOAD_SUPABASE_URL, FILE_UPLOAD_SUPABASE_ANON_KEY);

/** Maximum allowed PDF size: 25 MB */
const MAX_FILE_SIZE = 25 * 1024 * 1024;
/** Fetch timeout for webhook calls */
const WEBHOOK_TIMEOUT_MS = 60_000;

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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds the maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        { status: 413 }
      );
    }

    // Check if file_name already exists in institution table
    const fileName = file.name;
    const { data: existingFiles, error: checkError } = await supabase
      .from('institution')
      .select('file_name')
      .eq('file_name', fileName)
      .limit(1);

    if (checkError) {
      // Continue with upload even if check fails (don't block upload due to DB error)
    } else if (existingFiles && existingFiles.length > 0) {
      return NextResponse.json(
        {
          error: 'This PDF has already been processed',
          message: `The file "${fileName}" already exists in the system. Please upload a different file.`
        },
        { status: 409 }
      );
    }

    // Forward to webhook with timeout
    const webhookFormData = new FormData();
    webhookFormData.append('data', file, file.name);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: webhookFormData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // Don't leak internal webhook error details to the client
      return NextResponse.json(
        { error: 'PDF processing service returned an error. Please try again later.' },
        { status: 502 }
      );
    }

    const responseData = await response.text();

    return NextResponse.json(
      { success: true, message: 'PDF uploaded successfully', data: responseData },
      { status: 200 }
    );
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? 'Upload timed out. Please try again.' : 'Failed to upload PDF' },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
