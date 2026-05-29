import BibScanner from '@/components/BibScanner'

export default function RaceDayPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Race Day Station</h1>
        <p className="text-gray-500 mt-1">
          Enter a BIB number to advance a participant through race day stages.
        </p>
      </div>
      <BibScanner />
    </div>
  )
}
