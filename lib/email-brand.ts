// Shared CHM look for outgoing emails: red logo header and footer around the message.
const LOGO_URL = 'https://conveniencehubofmaryland.com/chm-logo.jpg'

export function brandedEmailHtml(bodyHtml: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A;">
  <div style="padding:20px 24px;border-bottom:3px solid #E8192C;">
    <img src="${LOGO_URL}" alt="Convenience Hub of Maryland" width="120" height="120" style="display:block;border:0;" />
    <p style="margin:8px 0 0;color:#E8192C;font-weight:bold;letter-spacing:2px;font-size:14px;">CONVENIENCE HUB OF MARYLAND</p>
  </div>
  <div style="padding:24px;font-size:15px;line-height:1.6;">${bodyHtml}</div>
  <div style="padding:16px 24px;border-top:1px solid #eeeeee;font-size:12px;color:#E8192C;">Convenience Hub of Maryland &middot; 202-579-2944 &middot; conveniencehubofmaryland@gmail.com</div>
</div>`
}
