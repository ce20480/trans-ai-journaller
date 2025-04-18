import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  return (
    <section className="py-20 bg-[#010101]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ever had a brilliant idea... and forgot it 10 minutes later?
          </h2>
          <p className="text-xl text-[#b3b3b3] mb-3">
            Your brain wasn&apos;t built to store ideas — it was built to create
            them.
          </p>
          <p className="text-xl text-[#b3b3b3] mb-8">
            But your system? That&apos;s where most ideas die.
          </p>

          <div className="flex flex-col items-center">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
