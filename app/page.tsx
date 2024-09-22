import Image from 'next/image'
import HomeForm from '@/components/HomeForm'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="flex items-center space-x-4"> {/* Flex layout to position elements side by side */}
        <HomeForm />
        <div className="flex flex-col items-center">
          {/* munilogo.png image */}
          <Image src="/munilogo.png" alt="Muni Logo" width={450} height={450} />
          {/* Word "muni" under the image */}
          {/* <span className="text-2xl font-bold text-white">muni</span> */}
          <span className="text-2xl font-bold text-white"></span>
          {/* <span className="text-2xl font-bold text-center text-white"> on demand check-ins, safety and community for all</span> */}
        </div>
      </div>
    </div>
  )
}
