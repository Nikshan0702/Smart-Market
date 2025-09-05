'use client';
import { ChartBarIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/20/solid';

const fashionFeatures = [
  {
    name: 'Real-time Trend Analysis',
    description: 'Leverage AI to identify emerging fashion trends from social media and search data, helping you stock what customers want before demand peaks.',
    icon: ChartBarIcon, // Using ChartBarIcon instead of TrendUpIcon
  },
  {
    name: 'Smart Inventory Optimization',
    description: 'Automatically adjust stock levels across locations based on local demand patterns, reducing overstock and stockouts.',
    icon: ShoppingBagIcon, // Using ShoppingBagIcon instead of InventoryIcon
  },
  {
    name: 'Personalized Upselling',
    description: 'Our AI recommends complementary items based on customer browsing behavior and purchase history, increasing average order value.',
    icon: SparklesIcon, // Using SparklesIcon instead of PersonalizeIcon
  },
];

export default function UI() {
  return (
    <div className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-[#E91E63]">Fashion Retail Intelligence</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Boost Sales with AI-Driven Insights
              </p>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Our platform helps fashion retailers increase conversion rates by 35% and reduce excess inventory by 50% through predictive analytics and customer behavior modeling.
              </p>
              <dl className="mt-8 max-w-xl space-y-6 text-base leading-7 text-gray-600 lg:max-w-none">
                {fashionFeatures.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-[#E91E63]" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8">
                <button className="rounded-md bg-[#E91E63] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#d81b60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E91E63]">
                  Request Demo
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"
              alt="Fashion analytics dashboard"
              className="w-full max-w-md rounded-xl shadow-xl ring-1 ring-gray-400/10"
              width={987}
              height={658}
            />
          </div>
        </div>
      </div>
    </div>
  );
}