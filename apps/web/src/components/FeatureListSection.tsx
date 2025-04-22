import WaitlistForm from "./WaitlistForm";

export default function FeatureListSection() {
  return (
    <section id="feature-list" className="py-20 bg-[#010101]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            We&apos;re constantly improving with new features
          </h2>
          <p className="text-xl text-[#b3b3b3] mb-3">
            Stay updated on our latest developments and upcoming features.
          </p>
          <p className="text-xl text-[#b3b3b3] mb-8">
            Join our feature notification list to be the first to know about new
            capabilities.
          </p>

          <div className="flex flex-col items-center">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
