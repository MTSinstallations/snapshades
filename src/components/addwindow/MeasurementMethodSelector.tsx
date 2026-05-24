import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface MeasurementMethodSelectorProps {
  selected: 'photo' | 'manual' | null;
  onSelectPhoto: () => void;
  onSelectManual: () => void;
}

/** Typing animation for the manual entry card */
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.15, duration: 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function MeasurementMethodSelector({
  selected,
  onSelectPhoto,
  onSelectManual,
}: MeasurementMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Option 1: Send a Photo */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={onSelectPhoto}
        className="group relative w-full rounded-2xl overflow-hidden border-2 border-blue-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all text-left bg-gradient-to-b from-blue-50 to-white"
      >
        {/* Recommended badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            RECOMMENDED
          </span>
        </div>

        {/* Photo area */}
        <div className="relative h-40 overflow-hidden">
          <img
            src="/tape-measure-window.jpg"
            alt="Tape measure held against window opening"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            Measure with Photo
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Easiest way — we read the measurements for you
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            (requires two people)
          </p>
          <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.button>

      {/* Option 2: Enter Measurements Yourself */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onSelectManual}
        className={`group relative w-full rounded-2xl overflow-hidden border-2 transition-all text-left ${
          selected === 'manual'
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 bg-white'
        }`}
      >
        {/* Animation area */}
        <div className="relative h-32 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden flex items-center justify-center">
          {/* Large DIY text in background */}
          <span className="absolute text-6xl font-black text-gray-200 select-none tracking-wider">DIY</span>

          <div className="relative flex flex-col items-center gap-2">
            <motion.div
              className="bg-white rounded-lg shadow-md px-4 py-2 border border-gray-200 flex items-center gap-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-gray-400 text-xs">Width:</span>
              <span className="font-mono font-bold text-gray-800 text-sm">
                <TypingText text='36 ½"' />
              </span>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg shadow-md px-4 py-2 border border-gray-200 flex items-center gap-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              <span className="text-gray-400 text-xs">Height:</span>
              <span className="font-mono font-bold text-gray-800 text-sm">
                <TypingText text='48 ¾"' delay={1.5} />
              </span>
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            Enter Your Own Measurements
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Already know your dimensions? Type them in.
          </p>
          <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
            Enter Dimensions <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.button>

      {/* Option 3: Professional Installation Service — Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-200 text-left bg-gradient-to-b from-amber-50 to-white opacity-80"
      >
        {/* Coming Soon badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            COMING SOON
          </span>
        </div>

        {/* Illustration area */}
        <div className="relative h-36 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden flex items-center justify-center">
          {/* Simple house icon */}
          <div className="relative">
            {/* Roof */}
            <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[40px] border-l-transparent border-r-transparent border-b-gray-300 mx-auto" />
            {/* House body */}
            <div className="w-[80px] h-[60px] bg-white border-2 border-gray-300 rounded-b-lg mx-auto relative">
              {/* Window */}
              <div className="absolute top-2 left-3 w-5 h-5 border-2 border-blue-200 bg-blue-50 rounded-sm" />
              {/* Door */}
              <div className="absolute bottom-0 right-4 w-5 h-8 bg-amber-700 rounded-t-md" />
            </div>
            {/* Pro technician icon */}
            <div className="absolute -bottom-4 right-2 flex flex-col items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full" />
              <div className="w-5 h-3 bg-blue-600 rounded-sm text-[5px] text-white font-bold flex items-center justify-center">PRO</div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900">
            Professional Installation Service
          </h3>
          <p className="text-sm text-amber-600 font-medium mt-1">
            Coming to your area soon!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            We'll send a certified technician to professionally measure and install your shades. No guesswork, no hassle.
          </p>
          <div className="mt-3 flex items-center gap-2 text-amber-600 font-semibold text-sm">
            Learn More <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
