'use client'

import React, { useState } from 'react'
import AnimatedSection from '@/components/AnimatedSection'

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'CONVENIENCEHUB'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="bg-white py-14 md:py-20 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Save and Earn</p>
            <h2 className="font-serif text-4xl md:text-5xl text-chm-black mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Referral and Discount Program
            </h2>
            <div className="w-10 h-px bg-chm-red" />
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <AnimatedSection delay={60}>
            <div className="border border-gray-200 p-8 md:p-10 bg-blush h-full">
              <h3 className="font-serif text-2xl md:text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                New Customer?
              </h3>

              <div className="mb-8">
                <p className="text-5xl md:text-6xl font-bold text-chm-red mb-2">15%</p>
                <p className="text-chm-black font-semibold mb-4">Off Your First Cleaning or Laundry Service</p>
                <div className="w-8 h-px bg-chm-red mb-6" />
              </div>

              <ul className="space-y-3 mb-8 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-chm-red font-bold mt-0.5">✓</span>
                  <span>15% off first laundry or cleaning service (10% on other services)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-chm-red font-bold mt-0.5">✓</span>
                  <span>Free in-home consultation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-chm-red font-bold mt-0.5">✓</span>
                  <span>No contract required</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-chm-red font-bold mt-0.5">✓</span>
                  <span>Lock in future pricing</span>
                </li>
              </ul>

              <a href="tel:+12025792944" className="block w-full bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors text-center">
                Claim Discount
              </a>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={120}>
            <div className="border border-gray-200 p-8 md:p-10 bg-cream h-full">
              <h3 className="font-serif text-2xl md:text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Existing Customer?
              </h3>

             <div className="space-y-4 mb-8">
                <div className="bg-white border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-chm-black">Refer 1 friend</p>
                    <p className="text-2xl font-bold text-chm-red">$20</p>
                  </div>
                  <p className="text-xs text-gray-600">credit</p>
                </div>

                <div className="bg-white border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-chm-black">Refer 3 friends</p>
                    <p className="text-2xl font-bold text-chm-red">$80</p>
                  </div>
                  <p className="text-xs text-gray-600">credit</p>
                </div>

                <div className="bg-white border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-chm-black">Refer 5 friends</p>
                    <p className="text-2xl font-bold text-chm-red">$150</p>
                  </div>
                  <p className="text-xs text-gray-600">credit</p>
                </div>

                <div className="bg-white border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-chm-black">Refer 10 friends</p>
                    <p className="text-2xl font-bold text-chm-red">Free month</p>
                  </div>
                  <p className="text-xs text-gray-600">up to $400 in services</p>
                </div>
              </div>

              <a href="tel:+12025792944" className="block w-full bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors text-center">
                Start Earning
              </a>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection className="mb-12">
          <div className="border border-gray-200 bg-white p-8 md:p-10">
            <h3 className="font-serif text-2xl md:text-3xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
              How It Works
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-chm-red text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold text-chm-black mb-2">Share Code</h4>
                <p className="text-xs text-gray-600 leading-relaxed">Send referral code to friends and family</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-chm-red text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold text-chm-black mb-2">They Book</h4>
                <p className="text-xs text-gray-600 leading-relaxed">Use code, get discount on first service</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-chm-red text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold text-chm-black mb-2">You Earn</h4>
                <p className="text-xs text-gray-600 leading-relaxed">Credit after their first service</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-chm-red text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold text-chm-black mb-2">Redeem</h4>
                <p className="text-xs text-gray-600 leading-relaxed">Use credits toward any service anytime</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="bg-chm-red text-white p-8 md:p-10 text-center">
            <h3 className="font-serif text-2xl md:text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Your Unique Referral Code
            </h3>
            <p className="mb-6 text-sm font-light">Share this code and start earning rewards</p>

            <div className="flex items-center justify-center gap-4 bg-white/20 rounded p-4 max-w-sm mx-auto backdrop-blur-sm mb-4">
              <p className="text-2xl font-bold">{referralCode}</p>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-white text-chm-red font-semibold text-xs uppercase tracking-widest rounded hover:bg-gray-100 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-xs font-light">Share on social media, email, or text</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
