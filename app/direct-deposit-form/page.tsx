'use client'

// Direct deposit form: fill in on screen, print or save as PDF, sign, then upload it in the welcome profile.
// Nothing on this page is sent to us. Only the file the applicant uploads is kept.
export default function DirectDepositFormPage() {
  const line = 'border-b border-gray-700 focus:outline-none focus:border-chm-red bg-transparent w-full py-1 text-sm'
  const label = 'block text-[11px] uppercase tracking-wider text-gray-600 font-semibold'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <style>{`
        @page { size: letter; margin: 0.5in; }
        @media print {
          .no-print { display: none !important; }
          .form-page { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: none !important; }
        }
      `}</style>

      <div className="no-print max-w-[8.5in] mx-auto mb-4 bg-white border border-gray-200 p-4 rounded text-sm text-gray-700">
        <p className="font-semibold mb-1">How to complete this form</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Type your information into the blank lines below.</li>
          <li>Click <strong>Print or Save as PDF</strong>. Choose &quot;Save as PDF&quot; as the printer if you want a file.</li>
          <li>Sign the printed form (or the PDF, if your device allows it), then upload it in your welcome profile under &quot;Direct Deposit Form or Voided Check.&quot;</li>
        </ol>
        <p className="mt-2 text-xs text-gray-500">Nothing you type here is sent to us. Only the file you upload in your welcome profile is saved.</p>
      </div>

      <div className="form-page max-w-[8.5in] mx-auto bg-white shadow-sm border border-gray-200 p-8 print:shadow-none">
        <div className="text-center mb-5">
          <p className="font-serif text-2xl text-chm-black">Convenience Hub of Maryland, LLC</p>
          <p className="text-sm text-gray-700 font-semibold tracking-wide">DIRECT DEPOSIT AUTHORIZATION FORM</p>
          <p className="text-xs text-gray-600 mt-1">Contractor payments (Friday pay schedule) &middot; 202-579-2944</p>
        </div>

        <section className="mb-4">
          <p className="text-xs uppercase tracking-widest text-chm-red font-semibold mb-2">1. Your information</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="col-span-2"><span className={label}>Full legal name</span><input className={line} type="text" name="fullName" /></div>
            <div><span className={label}>Email</span><input className={line} type="email" name="email" /></div>
            <div><span className={label}>Phone</span><input className={line} type="tel" name="phone" /></div>
            <div className="col-span-2"><span className={label}>Home address (street, city, state, ZIP)</span><input className={line} type="text" name="address" /></div>
          </div>
        </section>

        <section className="mb-4">
          <p className="text-xs uppercase tracking-widest text-chm-red font-semibold mb-2">2. Bank account</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="col-span-2"><span className={label}>Bank name</span><input className={line} type="text" name="bankName" /></div>
            <div className="col-span-2"><span className={label}>Name on the account (if different from above)</span><input className={line} type="text" name="accountHolder" /></div>
            <div>
              <span className={label}>Account type</span>
              <div className="flex gap-6 pt-2 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="accountType" value="checking" /> Checking</label>
                <label className="flex items-center gap-2"><input type="radio" name="accountType" value="savings" /> Savings</label>
              </div>
            </div>
            <div />
            <div><span className={label}>Routing number (9 digits)</span><input className={line} type="text" inputMode="numeric" maxLength={9} name="routingNumber" /></div>
            <div><span className={label}>Account number</span><input className={line} type="text" inputMode="numeric" name="accountNumber" /></div>
          </div>
          <p className="text-xs text-gray-600 mt-3">Instead of filling in this section, you may attach a voided check showing your name, bank name, routing number, and account number.</p>
        </section>

        <section className="mb-5">
          <p className="text-xs uppercase tracking-widest text-chm-red font-semibold mb-2">3. Authorization</p>
          <p className="text-xs text-gray-800 leading-relaxed">
            I authorize Convenience Hub of Maryland, LLC to deposit my contractor payments into the account above. I certify that the information on this form is correct. I will notify CHM in writing if my account changes, and I will submit a new form at that time.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6">
            <div><span className={label}>Signature (type your full name)</span><input className={line} type="text" name="signature" /></div>
            <div><span className={label}>Date</span><input className={line} type="date" name="signatureDate" /></div>
          </div>
        </section>

        <p className="text-[10px] text-gray-500 text-center">Convenience Hub of Maryland &middot; 202-579-2944 &middot; Keep this form private. Upload it only through your welcome profile.</p>
      </div>

      <div className="no-print max-w-[8.5in] mx-auto mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            try {
              window.print()
            } catch {
              alert('Printing is not available in this browser. Open this page in Safari or Chrome, then press Print or Save as PDF.')
            }
          }}
          className="bg-chm-red text-white px-5 py-2 text-xs font-semibold uppercase tracking-widest rounded hover:bg-red-700"
        >
          Print or Save as PDF
        </button>
      </div>
    </div>
  )
}
