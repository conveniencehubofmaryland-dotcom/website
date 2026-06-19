'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import AnimatedSection from '@/components/AnimatedSection'

interface SuccessStory {
  id: number
  name: string
  city: string
  problem: string
  solution: string
  result: string
  quote: string
  services: string[]
}

const stories: SuccessStory[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    city: 'Rockville, MD',
    problem: 'Marketing director with two kids under 5, feeling overwhelmed. Between work and kids, house was chaos. Exhausted, guilty, marriage tension.',
    solution: 'Weekly deep cleaning + bi-weekly laundry & linen management',
    result: 'Stress lifted within 3 weeks. Husband and wife reconnected. Kids eating better.',
    quote: 'Game changer. We got our life back.',
    services: ['Cleaning', 'Laundry'],
  },
  {
    id: 2,
    name: 'Michael Chen',
    city: 'Bethesda, MD',
    problem: 'Post-shoulder surgery recovery, unable to lift anything for 8 weeks. Wife works full-time, three kids, nobody could handle housework.',
    solution: '3x weekly home care + meal prep + light cleaning',
    result: 'Recovered 30% faster. Family stress dramatically reduced.',
    quote: 'They came through when we needed it most.',
    services: ['Home Care', 'Meal Prep', 'Cleaning'],
  },
  {
    id: 3,
    name: 'Dr. Priya Kapoor',
    city: 'Arlington, VA',
    problem: 'Hospital administrator working 55+ hours, managing multiple vendors. Chaotic coordination, spending time managing vendors not family.',
    solution: 'Consolidated service: cleaning + childcare + meal prep under one team',
    result: 'Stress dropped 50%. One phone call, one invoice. Actual weekends returned.',
    quote: 'Best decision I made for my family.',
    services: ['Cleaning', 'Childcare', 'Meal Prep'],
  },
  {
    id: 4,
    name: 'James & Lisa Rodriguez',
    city: 'Chevy Chase, MD',
    problem: 'New parents, Lisa returning to work 8 weeks postpartum. Sleep deprived, no clean laundry, eating cold leftovers at midnight.',
    solution: 'Postpartum support: house cleaning, laundry, meal prep, childcare',
    result: 'Smoother recovery, family bonded instead of fighting about dishes.',
    quote: 'Wish we\'d done this from day one.',
    services: ['Cleaning', 'Laundry', 'Meal Prep', 'Childcare'],
  },
  {
    id: 5,
    name: 'Tom McCarthy',
    city: 'Silver Spring, MD',
    problem: 'Senior parent (78) living alone, wanted independence after a fall. Worried about safety, nutrition, isolation. Mom refused assisted living.',
    solution: '3x weekly care companion visits + meal prep + light housekeeping',
    result: 'Mom regained confidence. Social engagement restored. Tom sleeps at night.',
    quote: 'You gave my mom her dignity back.',
    services: ['Senior Care', 'Care Companion', 'Meal Prep'],
  },
  {
    id: 6,
    name: 'Ambassador & Dr. Okoro',
    city: 'Washington, D.C.',
    problem: 'Both high-powered professionals, international travel, two teenage kids. No consistent household help, kids eating fast food, house neglected.',
    solution: 'Premium service: daily meal prep, weekly cleaning, laundry, after-school coordination',
    result: 'Kids eating healthier. House organized. Actual family dinners 5 nights/week.',
    quote: 'Worth every penny. We can\'t imagine life without them.',
    services: ['Cleaning', 'Meal Prep', 'Laundry', 'Childcare'],
  },
  {
    id: 7,
    name: 'Jennifer Walsh',
    city: 'Columbia, MD',
    problem: 'Recently remarried, blended family with three kids, new house. Kids didn\'t feel at home, chaos everywhere, stress blocking family bonding.',
    solution: 'Weekly cleaning + childcare to reduce stress and create stability',
    result: 'House became home. Kids relaxed and bonded with each other.',
    quote: 'You helped us become a real family.',
    services: ['Cleaning', 'Childcare'],
  },
  {
    id: 8,
    name: 'David Zhang',
    city: 'Ashburn, VA',
    problem: 'Tech entrepreneur, working 70+ hours/week, two young kids. Choosing work over family because household stuff was overwhelming.',
    solution: 'Comprehensive service: housekeeping, laundry, meal prep, childcare',
    result: 'Startup growing AND family thriving. Wife says he\'s "present" again.',
    quote: 'They allowed me to have it all.',
    services: ['Cleaning', 'Laundry', 'Meal Prep', 'Childcare'],
  },
  {
    id: 9,
    name: 'Dorothy Williams',
    city: 'Hyattsville, MD',
    problem: 'Recent widow (72), living alone, grieving. House felt too big, couldn\'t manage alone, family worried about depression.',
    solution: 'Bi-weekly cleaning + meal prep + care companion visits for social support',
    result: 'Maintained independence while grieving. Avoided isolation spiral.',
    quote: 'They took care of me when I needed it most.',
    services: ['Cleaning', 'Meal Prep', 'Care Companion'],
  },
  {
    id: 10,
    name: 'Marcus Thompson',
    city: 'Alexandria, VA',
    problem: 'Solo attorney, always busy, wife managing most household responsibilities. Wife burning out, failing at life management, husband wanting to help.',
    solution: 'Weekly cleaning, Sunday meal prep, laundry, childcare coordination',
    result: 'Wife had bandwidth to relax. Couple became partners again.',
    quote: 'Saved our marriage. Sounds dramatic but it\'s true.',
    services: ['Cleaning', 'Meal Prep', 'Laundry', 'Childcare'],
  },
]

export default function SuccessStories() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length)
  }

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }

  const story = stories[currentIndex]

  return (
    <section className="bg-cream py-14 md:py-20 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Real Transformations</p>
            <h2 className="font-serif text-4xl md:text-5xl text-chm-black mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Success Stories
            </h2>
            <div className="w-10 h-px bg-chm-red" />
          </div>
        </AnimatedSection>

        {/* Story Display */}
        <AnimatedSection className="mb-10">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: Quote & Details */}
              <div className="p-8 md:p-10 flex flex-col justify-center bg-blush">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-2xl md:text-3xl font-serif text-chm-black mb-8 leading-snug italic" style={{ fontFamily: 'var(--font-serif)' }}>
                  "{story.quote}"
                </p>

                <div className="space-y-5 mb-8">
                  <div>
                    <p className="text-chm-black font-semibold">{story.name}</p>
                    <p className="text-sm text-gray-500">{story.city}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-chm-red uppercase tracking-widest mb-2">Challenge</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{story.problem}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-chm-red uppercase tracking-widest mb-2">Solution</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{story.solution}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-chm-red uppercase tracking-widest mb-2">Result</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{story.result}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {story.services.map((service) => (
                      <span key={service} className="px-3 py-1 bg-white text-chm-red text-xs font-semibold border border-chm-red rounded">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Image Placeholder */}
              <div className="h-64 md:h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">{story.name}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Navigation */}
        <AnimatedSection className="flex items-center justify-between">
          <button
            onClick={prevStory}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous story"
          >
            <ChevronLeft size={24} className="text-chm-black" />
          </button>

          <div className="flex gap-2 flex-wrap justify-center flex-1 px-4">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  currentIndex === index ? 'bg-chm-red text-white' : 'bg-gray-200 text-chm-black hover:bg-gray-300'
                }`}
              >
                {stories[index].name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={nextStory}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next story"
          >
            <ChevronRight size={24} className="text-chm-black" />
          </button>
        </AnimatedSection>
      </div>
    </section>
  )
}
