interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = ['Details', 'Register', 'Watch', 'Other'];

  return (
    <div className="relative mb-12 px-4 md:px-6">
      <div className="mb-6 flex h-1 overflow-hidden rounded bg-gray-300">
        <div
          className={`w-${(currentStep / (steps.length - 1)) * 100}% bg-blue-600`}
        />
      </div>

      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div
              className={`mx-auto flex size-10 items-center justify-center rounded-full border-2 ${
                currentStep >= index
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-400 bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > index ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div
              className={`mt-2 text-sm ${currentStep >= index ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
