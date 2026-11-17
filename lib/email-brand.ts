// Shared CHM look for every outgoing email: red logo header and contact footer.
// Works on a fragment (wrapped whole) or a full HTML document (header and footer added inside <body>).
// Safe to call twice: an email that already has the header is returned unchanged.
const LOGO_URL = 'https://conveniencehubofmaryland.com/chm-logo.jpg'

export const CHM_REPLY_TO = 'conveniencehubofmaryland@gmail.com'

const HEADER = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A;">
  <div style="padding:20px 24px;border-bottom:3px solid #E8192C;">
    <img src="${LOGO_URL}" alt="Convenience Hub of Maryland" width="120" height="120" style="display:block;border:0;" />
    <p style="margin:8px 0 0;color:#E8192C;font-weight:bold;letter-spacing:2px;font-size:14px;">CONVENIENCE HUB OF MARYLAND</p>
  </div>
  <div style="padding:24px;font-size:15px;line-height:1.6;">`

const FOOTER = `</div>
  <div style="padding:16px 24px;border-top:1px solid #eeeeee;font-size:12px;color:#E8192C;">Convenience Hub of Maryland &middot; 202-579-2944 &middot; conveniencehubofmaryland@gmail.com</div>
</div>`

export function brandedEmailHtml(bodyHtml: string): string {
  if (bodyHtml.includes(LOGO_URL)) return bodyHtml
  const bodyOpen = /<body[^>]*>/i.exec(bodyHtml)
  if (bodyOpen) {
    const start = bodyOpen.index + bodyOpen[0].length
    const end = bodyHtml.toLowerCase().lastIndexOf('</body>')
    if (end > start) {
      return bodyHtml.slice(0, start) + HEADER + bodyHtml.slice(start, end) + FOOTER + bodyHtml.slice(end)
    }
  }
  return HEADER + bodyHtml + FOOTER
}

// Same as brandedEmailHtml, under the name used at send sites.
export const brandEmail = brandedEmailHtml
