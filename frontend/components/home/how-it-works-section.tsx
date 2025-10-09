import BgGradient from "../common/bg-gradient";

export default function HowItWorksSection() {
    return (
        <BgGradient>
        <section className="w-full py-12 md:py-16 lg:py-24">
            <div className="container mx-auto px-4 text-center space-y-6 lg:pt-12">
                <div className="text-center mb-16">
                    <h6 className="font-bold text-xl uppercase mb-4 text-rose-500">
                        HOW IT WORKS
                    </h6>
                    <h3 className="font-bold text-3xl max-w-2xl mx-auto">
                        Transform any pdf into an easy-to-digest summary in 
                        three simple steps.
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
                </div>
            </div>
        </section>
        </BgGradient>
    )
}