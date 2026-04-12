import { ArrowPathIcon, CloudArrowUpIcon, FingerPrintIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Digital Twin Creation',
    description:
      'Create a hyper-realistic 3D model that matches your exact body proportions and skin tone',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Virtual Try-On',
    description:
      'See how clothes look on you instantly with AI-powered rendering and real-time visualization',
    icon: LockClosedIcon,
  },
  {
    name: 'Compare Across Brands ',
    description:
      'Try outfits from multiple stores simultaneously and find your perfect fit every time',

    icon: ArrowPathIcon,
  },
  {
    name: 'Shop Smart',
    description:
      'Make confident purchases knowing exactly how items will look and fit on your body',
    icon: FingerPrintIcon,
  },
]

export default function WhySection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance bg-gradient-to-r from-blue-800 via-purple-700 to-pink-600 bg-clip-text text-transparent">
            Why You Choose TryVora
          </p>
          <p className="mt-6 text-lg/8 text-gray-800">
           Experience cutting-edge technology that transforms how you shop for
            fashion
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-blue-800">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-500">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-black">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
