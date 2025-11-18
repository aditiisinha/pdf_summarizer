import { SignIn } from '@clerk/nextjs'
import BgGradient from '../../../components/common/bg-gradient'

export default function Page() {
    return (
     <section className="flex justify-center items-center lg:min-h-[60vh]">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        
        <BgGradient className='from-rose-600 via-rose-400 to-orange-300'>
          <div className="p-10 rounded-2xl">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "bg-transparent shadow-none",
                  card: "bg-transparent shadow-none"
                }
              }}
            />
          </div>
        </BgGradient>

      </div>
    </section>
    )
}