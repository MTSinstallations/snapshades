import { useParams } from 'react-router-dom'
import { Camera } from 'lucide-react'

export default function MeasurePage() {
  const { sessionId } = useParams()
  
  return (
    <div className="min-h-screen bg-snap-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <Camera className="w-16 h-16 text-snap-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Measurement Mode</h1>
        <p className="mt-2 text-gray-600">
          Session: <code className="text-snap-600">{sessionId}</code>
        </p>
        <p className="mt-4 text-gray-600">
          Use your phone camera to snap photos of your windows. 
          Photos will sync to your project in real-time.
        </p>
        <button className="mt-6 w-full bg-snap-600 text-white py-3 rounded-full font-semibold hover:bg-snap-700 transition">
          Open Camera
        </button>
      </div>
    </div>
  )
}
