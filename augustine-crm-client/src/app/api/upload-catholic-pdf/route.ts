import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://gluagents.xyz/webhook/upload-ocd-by-city';

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

