import { motion } from 'framer-motion';
import { Calendar, Settings, Video } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ProgressBarProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function ProgressBar({
  currentStep,
  onStepClick,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const steps = [
    { name: 'Details', icon: Video, color: 'blue' },
    { name: 'Video upload', icon: Video, color: 'purple' },
    { name: 'Watch', icon: Calendar, color: 'green' },
    { name: 'Other', icon: Settings, color: 'amber' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Check mark animation variants
  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.1,
      },
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.5,
        repeat: 0,
        repeatType: 'loop' as const,
      },
    },
  };

  // Handle step click
  const handleStepClick = (index: number) => {
    // Only allow clicking on completed steps or the next available step
    if (index <= currentStep + 1 && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <motion.div
      className="relative mb-8 px-4 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Progress bar background */}
      <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
            transition: { duration: 0.5, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="relative flex justify-between">
        {/* Step indicators */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep >= index;
          const isCompleted = currentStep > index;
          const isClickable = index <= currentStep + 1;

          return (
            <motion.div
              key={index}
              className="relative z-10 text-center"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={`mx-auto flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? `border-${step.color}-600 bg-${step.color}-600 dark:border- text-white${step.color}-400 dark:bg-${step.color}-500 dark:text-white`
                    : 'border-gray-300 bg-gray-100 text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400'
                } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isActive ? 1 : 0.8,
                  borderColor: isActive
                    ? theme === 'dark'
                      ? `var(--${step.color}-400)`
                      : `var(--${step.color}-600)`
                    : theme === 'dark'
                      ? '#4b5563'
                      : '#d1d5db',
                  backgroundColor: isActive
                    ? theme === 'dark'
                      ? `var(--${step.color}-500)`
                      : `var(--${step.color}-600)`
                    : theme === 'dark'
                      ? '#334155'
                      : '#f3f4f6',
                  color: isActive
                    ? '#ffffff'
                    : theme === 'dark'
                      ? '#94a3b8'
                      : '#6b7280',
                }}
                transition={{ duration: 0.3 }}
                onClick={() => handleStepClick(index)}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? (
                  <motion.div
                    className="relative"
                    variants={checkmarkVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="pulse"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-500 opacity-20 dark:bg-green-400/30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.1, 0.2],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'loop' as const,
                      }}
                    />
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5 text-green-500 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  </motion.div>
                ) : (
                  <Icon className="size-4" />
                )}
              </motion.div>
              <motion.div
                className={`mt-1 text-xs font-medium ${
                  isActive
                    ? `text-${step.color}-600 dark:text-${step.color}-400`
                    : 'text-gray-500 dark:text-slate-400'
                }`}
                initial={{ opacity: 0.7 }}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  color: isActive
                    ? theme === 'dark'
                      ? `var(--${step.color}-400)`
                      : `var(--${step.color}-600)`
                    : theme === 'dark'
                      ? '#94a3b8'
                      : '#6b7280',
                }}
                transition={{ duration: 0.3 }}
              >
                {step.name}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
