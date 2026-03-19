import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const enquiryId = formData.get('enquiryId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type required' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/heic',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PDF, JPG, PNG, or Word documents.' 
      }, { status: 400 })
    }

    // Create a unique filename with user ID prefix for organization
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const pathname = `documents/${user.id}/${timestamp}-${sanitizedName}`

    // Upload to Vercel Blob (private storage)
    const blob = await put(pathname, file, {
      access: 'private',
    })

    // Store document metadata in database (if table exists)
    // For now, we'll just return the upload result
    // Later you can add: await supabase.from('documents').insert(...)

    return NextResponse.json({ 
      success: true,
      pathname: blob.pathname,
      documentType,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
