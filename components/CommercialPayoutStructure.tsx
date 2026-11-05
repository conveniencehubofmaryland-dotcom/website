import {
  COMMERCIAL_CHM_FEE_BANDS,
  splitCommercialContract,
} from '@/lib/contractor-compensation'

const FEE_ROWS = [
  { range: '$500 – $999', chmFee: COMMERCIAL_CHM_FEE_BANDS[0].chmFee },
  { range: '$1,000 – $2,999', chmFee: COMMERCIAL_CHM_FEE_BANDS[1].chmFee },
  { range: '$3,000 – $7,499', chmFee: COMMERCIAL_CHM_FEE_BANDS[2].chmFee },
  { range: '$7,500 and above', chmFee: COMMERCIAL_CHM_FEE_BANDS[3].chmFee },
]

const COMMERCIAL_INCENTIVES = [
  'Zero complaints for the quarter: $100 – $250',
  'Upsell of additional services: 10% – 15% commission on the upsold amount',
  'Referral of a new commercial account: 5% of the fees from that account for 3 months',
  'One-year partnership milestone: $500 – $1,000 one-time payment',
]

export default function CommercialPayoutStructure() {
  const example = splitCommercialContract(2000)

  return (
    <div className="bg-gradient-to-br from-chm-red/5 to-chm-red/10 border border-chm-red/20 rounded-lg p-8">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-chm-black mb-2">Commercial Contractor Payouts</h2>
        <p className="text-gray-600 text-sm">Commercial cleaning contracts</p>
      </div>

      <div className="mb-8 bg-white border border-gray-200 p-5 rounded text-sm text-gray-700">
        You are an independent contractor. You are paid a share of the monthly contract value. The share depends on the size of the contract.
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-chm-black mb-4">Your Share by Contract Size</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEE_ROWS.map(row => {
            const contractorKeeps = Math.round((1 - row.chmFee) * 100)
            return (
              <div key={row.range} className="bg-white border border-gray-200 p-4 rounded">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Monthly contract {row.range}</p>
                <p className="text-2xl font-bold text-chm-red">{contractorKeeps}%</p>
                <p className="text-xs text-gray-600 mt-2">You keep this share. CHM fee: {Math.round(row.chmFee * 100)}%.</p>
              </div>
            )
          })}
        </div>
      </div>

      {example && (
        <div className="mb-8 bg-white border border-gray-200 p-5 rounded text-sm text-gray-700">
          <p className="font-semibold text-chm-black mb-2">Example</p>
          <p>
            A $2,000 monthly contract has a {Math.round(example.chmRate * 100)}% CHM fee. CHM receives ${example.chm.toFixed(2)} and you receive ${example.contractor.toFixed(2)}, before your own labor and expenses.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6 rounded mb-8">
        <h3 className="text-lg font-semibold text-chm-black mb-2">Optional Performance Incentives</h3>
        <p className="text-xs text-gray-500 mb-4">Paid from the CHM share. These are optional bonuses, not wages, and they do not change your tier.</p>
        <div className="space-y-2">
          {COMMERCIAL_INCENTIVES.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-chm-red font-bold">✓</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded">
        <h3 className="text-lg font-semibold text-chm-black mb-4">Payments</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Payouts are processed weekly on Fridays.</p>
          <p>You receive a statement with each payout showing the client fees, your share, CHM share, incentives, and the amount paid.</p>
          <p>A completed IRS Form W-9 is required before your first payment.</p>
          <p>CHM does not withhold income or payroll taxes. You are responsible for your own taxes, business licenses, insurance, and supplies unless your written agreement says otherwise.</p>
        </div>
      </div>
    </div>
  )
}
