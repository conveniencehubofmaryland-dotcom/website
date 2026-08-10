import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('staff_module_progress')
      .select('*, training_modules(title)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const completedDate = data.completed_at
      ? new Date(data.completed_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Not completed'

    const score = data.quiz_score ? `${data.quiz_score}%` : 'N/A'
    const moduleName = data.training_modules?.title || 'Training Module'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Training Certificate</title>
          <style>
            body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; text-align: center; }
            h1 { font-size: 28px; margin: 20px 0; }
            h2 { font-size: 20px; font-weight: normal; margin: 30px 0; }
            .certificate-box { 
              border: 3px solid #8B0000; 
              padding: 40px; 
              margin: 40px 0; 
              background-color: #fffaf0;
            }
            .certificate-header { font-size: 24px; font-weight: bold; color: #8B0000; margin-bottom: 30px; }
            .certificate-text { font-size: 16px; margin: 15px 0; }
            .staff-name { font-size: 20px; font-weight: bold; margin: 20px 0; }
            .module-name { font-size: 18px; margin: 20px 0; }
            .score { font-size: 14px; color: #666; margin: 10px 0; }
            .signature-line { 
              border-top: 1px solid #000; 
              margin-top: 40px; 
              padding-top: 5px; 
              display: inline-block; 
              width: 200px; 
            }
            .footer { font-size: 12px; color: #666; margin-top: 40px; }
          </style>
        </head>
        <body>
          <h1>CONVENIENCE HUB OF MARYLAND</h1>
          
          <div class="certificate-box">
            <div class="certificate-header">Certificate of Completion</div>
            
            <p class="certificate-text">This is to certify that</p>
            
            <p class="staff-name">${data.staff_name}</p>
            
            <p class="certificate-text">has successfully completed the training module</p>
            
            <p class="module-name">${moduleName}</p>
            
            <p class="score">Quiz Score: ${score}</p>
            
            <p class="certificate-text">On ${completedDate}</p>
            
            <p class="certificate-text">Signed and sealed by Convenience Hub of Maryland</p>
            
            <div style="margin-top: 40px;">
              <p style="font-size: 14px; color: #8B0000; font-weight: bold;">CONVENIENCE HUB OF MARYLAND</p>
              <div class="signature-line"></div>
              <p style="font-size: 12px; margin-top: 5px;">Official Stamp</p>
            </div>
          </div>

          <div class="footer">
            <p>Convenience Hub of Maryland • 202-579-2944</p>
            <p style="color: #999;">Certificate ID: ${data.id}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Certificate-${data.staff_name}.html"`,
      },
    })
  } catch (err) {
    console.error('[certifications download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
