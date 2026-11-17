'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const W9_URL = 'https://www.irs.gov/pub/irs-pdf/fw9.pdf'

// Direct deposit and certificate uploads. Each one is saved to the applicant's Documents in admin.
const DOCUMENT_FIELDS = [
  { key: 'directDeposit', label: 'Direct Deposit Form or Voided Check', required: true, help: 'Fill in our Direct Deposit Form, print or save it as a PDF, sign it, then upload it here. You may upload a voided check instead. Your payments are sent to this account.', linkHref: '/direct-deposit-form', linkText: 'Open the Direct Deposit Form' },
  { key: 'cprCertificate', label: 'CPR Certificate', required: true, help: 'Upload your current CPR certificate.' },
  { key: 'firstAidCertificate', label: 'First Aid Certificate', required: true, help: 'Upload your current First Aid certificate.' },
  { key: 'cmtCertificate', label: 'CMT Certificate', required: false, help: 'Optional. Upload your CMT certificate if you have one.' },
  { key: 'cnaCertificate', label: 'CNA Certificate', required: false, help: 'Optional. Upload your CNA certificate if you have one.' },
  { key: 'staffPhoto', label: 'Staff Photo (for your badge)', required: true, help: 'Upload a clear, recent photo of your face. JPG or PNG, up to 3 MB. It appears on your CHM staff badge.', accept: '.jpg,.jpeg,.png' },
]
const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary/Chef',
  'Nanny/Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]
const SEX_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
]
export default function WelcomeCenterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invite_token = searchParams.get('invite')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    sex: '',
    date_of_birth: '',
    position: '',
    years_of_experience: '',
    acknowledged_1099: false,
    own_car: 'no',
    backgroundCheckFile: null as File | null,
    w9File: null as File | null,
  })
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({})
  const [idFiles, setIdFiles] = useState<{ governmentId: File | null; socialSecurityCard: File | null }>({
    governmentId: null,
    socialSecurityCard: null,
  })
  const [idNotExpired, setIdNotExpired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [applicantId, setApplicantId] = useState<string>('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      backgroundCheckFile: file,
    }))
  }

  const handleW9FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      w9File: file,
    }))
  }

  const handleDocFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setDocFiles(prev => ({ ...prev, [key]: file }))
  }

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      own_car: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.address.trim() ||
      !formData.sex ||
      !formData.date_of_birth ||
      !formData.position ||
      formData.years_of_experience === '' ||
      !formData.acknowledged_1099 ||
      !formData.backgroundCheckFile ||
      !formData.w9File ||
      !docFiles.directDeposit ||
      !docFiles.cprCertificate ||
      !docFiles.firstAidCertificate ||
      !docFiles.staffPhoto ||
      !idFiles.governmentId ||
      !idFiles.socialSecurityCard ||
      !idNotExpired
    ) {
      setError('All fields are required, including your background check and completed IRS Form W-9')
      setLoading(false)
      return
    }
    try {
      const fd = new FormData()
      fd.append('full_name', formData.full_name)
      fd.append('email', formData.email)
      fd.append('phone', formData.phone)
      fd.append('address', formData.address.trim())
      fd.append('sex', formData.sex)
      fd.append('date_of_birth', formData.date_of_birth)
      fd.append('position', formData.position)
      fd.append('years_of_experience', formData.years_of_experience)
      fd.append('acknowledged_1099', String(formData.acknowledged_1099))
      fd.append('own_car', formData.own_car)
      if (formData.backgroundCheckFile) {
        fd.append('backgroundCheck', formData.backgroundCheckFile)
      }
      if (formData.w9File) {
        fd.append('w9File', formData.w9File)
      }
      DOCUMENT_FIELDS.forEach(f => {
        const file = docFiles[f.key]
        if (file) fd.append(f.key, file)
      })
      fd.append('idNotExpired', String(idNotExpired))
      if (idFiles.governmentId) fd.append('governmentId', idFiles.governmentId)
      if (idFiles.socialSecurityCard) fd.append('socialSecurityCard', idFiles.socialSecurityCard)
      if (invite_token) {
        fd.append('invite_token', invite_token)
      }

      const res = await fetch('/api/welcome-center/submit', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit profile')
      }
      setApplicantId(data.applicant_id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  const handleContinueToOrientation = () => {
    if (applicantId) {
      router.push(
        `/staff/orientation?applicant_id=${applicantId}&position=${encodeURIComponent(formData.position)}`
      )
    }
  }
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow p-12">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="font-serif text-3xl text-chm-black mb-4">Profile Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for completing your welcome profile, {formData.full_name.split(' ')[0]}!
            </p>
            <div className="bg-cream p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-700 mb-4">
                Check your email for next steps. You&apos;ll receive:
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-700 mb-8">
                <li>✓ Orientation document to review and sign</li>
                <li>✓ Link to required training modules</li>
                <li>✓ Instructions to claim your first shift</li>
              </ul>
              <button
                onClick={handleContinueToOrientation}
                className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors rounded"
              >
                Continue to Orientation →
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              Questions? Contact HR at 202-579-2944 or conveniencehubofmaryland@gmail.com
            </p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-4xl text-chm-black mb-3">Welcome to CHM</h1>
          <p className="text-gray-600">Complete your profile to get started with your onboarding.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="(202) 555-0100"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Full Home Address *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="Street, city, state, ZIP"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Sex / Gender *
            </label>
            <select
              name="sex"
              required
              value={formData.sex}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="">Select…</option>
              {SEX_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              name="date_of_birth"
              required
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Position Applied For *
            </label>
            <select
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="">Select…</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Years of Experience *
            </label>
            <input
              type="number"
              name="years_of_experience"
              required
              min={0}
              max={80}
              value={formData.years_of_experience}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="e.g. 5"
            />
          </div>

          {/* NEW: Do you own a reliable vehicle? */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Do you own a reliable vehicle? *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="own_car"
                  value="yes"
                  checked={formData.own_car === 'yes'}
                  onChange={() => handleRadioChange('yes')}
                  className="w-4 h-4 accent-chm-red"
                />
                <span className="text-sm text-gray-700">Yes, I own a reliable vehicle</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="own_car"
                  value="no"
                  checked={formData.own_car === 'no'}
                  onChange={() => handleRadioChange('no')}
                  className="w-4 h-4 accent-chm-red"
                />
                <span className="text-sm text-gray-700">No, I do not own a vehicle</span>
              </label>
            </div>
          </div>

          {/* NEW: Background Check Upload */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Background Check Document (PDF, JPG, or PNG) *
            </label>
            <p className="text-xs text-gray-500 mb-2">Required. Maximum file size: 10 MB</p>
            <input
              type="file"
              name="backgroundCheck"
              required
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-chm-red rounded"
            />
            {formData.backgroundCheckFile && (
              <p className="text-xs text-green-600 mt-2">
                ✓ {formData.backgroundCheckFile.name} selected
              </p>
            )}
          </div>

          {/* IRS Form W-9: applicant fills the official IRS form and attaches it here */}
          <div className="border border-gray-200 p-6 rounded-lg space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">IRS Form W-9 *</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Required for contractor payments. Step 1: open the official IRS Form W-9, fill it in and sign it (you can save it to your phone or computer). Step 2: attach the completed form below.
              </p>
            </div>
            <a
              href={W9_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center border border-chm-red text-chm-red py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-50 transition-colors rounded"
            >
              Open IRS Form W-9 (irs.gov) →
            </a>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Attach completed W-9 (PDF, JPG, or PNG) *</label>
              <p className="text-xs text-gray-500 mb-2">Maximum file size: 10 MB</p>
              <input
                type="file"
                name="w9File"
                required
                onChange={handleW9FileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-chm-red rounded"
              />
              {formData.w9File && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ {formData.w9File.name} selected
                </p>
              )}
            </div>
          </div>

          {/* Identity documents: private, admin-only */}
          <div className="border border-gray-200 p-6 rounded-lg space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Identity Documents *</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Required. Attach a clear photo or scan of each item. Only CHM admin can view these files. Maximum file size: 10 MB each.
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Valid Government-Issued Photo ID *</label>
              <p className="text-xs text-gray-500 mb-2">Driver&apos;s license, state ID, or passport.</p>
              <input
                type="file"
                name="governmentId"
                required
                onChange={e => setIdFiles(prev => ({ ...prev, governmentId: e.target.files?.[0] || null }))}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-chm-red rounded"
              />
              {idFiles.governmentId && (
                <p className="text-xs text-green-600 mt-2">✓ {idFiles.governmentId.name} selected</p>
              )}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Social Security Card *</label>
              <p className="text-xs text-gray-500 mb-2">Upload a photo or scan of the card.</p>
              <input
                type="file"
                name="socialSecurityCard"
                required
                onChange={e => setIdFiles(prev => ({ ...prev, socialSecurityCard: e.target.files?.[0] || null }))}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-chm-red rounded"
              />
              {idFiles.socialSecurityCard && (
                <p className="text-xs text-green-600 mt-2">✓ {idFiles.socialSecurityCard.name} selected</p>
              )}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="idNotExpired"
                required
                checked={idNotExpired}
                onChange={e => setIdNotExpired(e.target.checked)}
                className="w-5 h-5 accent-chm-red mt-1 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">I confirm my government-issued photo ID is not expired. *</span>
            </label>
          </div>

          {/* Direct deposit and certificates */}
          <div className="border border-gray-200 p-6 rounded-lg space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Direct Deposit &amp; Certificates</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">Attach a PDF, JPG, or PNG for each item. Maximum file size: 10 MB each.</p>
            </div>
            {DOCUMENT_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  {f.label}{f.required ? ' *' : ' (optional)'}
                </label>
                <p className="text-xs text-gray-500 mb-2">{f.help}</p>
                {'linkHref' in f && f.linkHref && (
                  <a
                    href={f.linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mb-3 text-xs font-semibold text-chm-red underline"
                  >
                    {'linkText' in f ? f.linkText : 'Open form'} →
                  </a>
                )}
                <input
                  type="file"
                  name={f.key}
                  required={f.required}
                  onChange={e => handleDocFileChange(f.key, e)}
                  accept={'accept' in f ? f.accept : '.pdf,.jpg,.jpeg,.png'}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-chm-red rounded"
                />
                {docFiles[f.key] && (
                  <p className="text-xs text-green-600 mt-2">✓ {docFiles[f.key]?.name} selected</p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acknowledged_1099"
                required
                checked={formData.acknowledged_1099}
                onChange={handleChange}
                className="w-5 h-5 accent-chm-red mt-1 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-chm-black">
                  I acknowledge this is a 1099 independent contractor position *
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  I understand that I am an independent contractor and not an employee. I am responsible for my own taxes, insurance, and benefits.
                </p>
              </div>
            </label>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60 rounded"
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            All fields marked with * are required. Please review your information before submitting.
          </p>
        </form>
      </div>
    </div>
  )
}
