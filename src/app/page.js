'use client';
import { ChartBarIcon, BriefcaseIcon, UserGroupIcon } from '@heroicons/react/20/solid';

const tenderFeatures = [
  {
    name: 'Real-time Tender Insights',
    description: 'Stay updated with live analytics and market trends to make informed bidding decisions instantly.',
    icon: ChartBarIcon,
  },
  {
    name: 'Smart Vendor Connection',
    description: 'Easily connect with vendors, suppliers, and partners through AI-driven matchmaking and recommendations.',
    icon: BriefcaseIcon,
  },
  {
    name: 'Collaborative Bidding',
    description: 'Work with teams and stakeholders seamlessly, ensuring transparency and compliance in every tender.',
    icon: UserGroupIcon,
  },
];

export default function TenderSystem() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="bg-[#288984] text-white shadow">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SBCP</h1>
          <nav className="space-x-6">
            
            <a href="/SignUpPage" className="hover:text-blue-200">Sign UP</a>
            <a href="/SignInPage" className="hover:text-blue-200">Sign IN</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}



      <main className="flex-grow">
        <div className="overflow-hidden py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pr-8 lg:pt-4">
                <div className="lg:max-w-lg">
                  <h2 className="text-base font-semibold leading-7 text-[#288984]">Tender Management System</h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Smarter Bidding, Stronger Connections
                  </p>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    Our TenderSystem helps organizations manage bids efficiently, connect with the right vendors, and ensure fair,
                    transparent, and data-driven procurement decisions.
                  </p>
                  <dl className="mt-8 max-w-xl space-y-6 text-base leading-7 text-gray-600 lg:max-w-none">
                    {tenderFeatures.map((feature) => (
                      <div key={feature.name} className="relative pl-9">
                        <dt className="inline font-semibold text-gray-900">
                          <feature.icon
                            className="h-4 w-4 text-[#288984] focus:ring-blue-500 border-gray-300 rounded absolute left-1 top-1"
                            aria-hidden="true"
                          />
                          {feature.name}
                        </dt>{' '}
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8">
                    <button className="rounded-md bg-[#288984] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      Explore Tenders
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=987&q=80"
                  alt="Tender dashboard"
                  className="w-full max-w-md rounded-xl shadow-xl ring-1 ring-gray-400/10"
                  width={987}
                  height={658}
                />
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer className="bg-gray-100 border-t">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} DATTREO. All rights reserved.</p>
          <div className="space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
