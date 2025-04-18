import Link from "next/link";
import Image from "next/image";
import WaitlistSection from "@/components/WaitlistSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
      {/* Hero Section */}
      <section className="py-20 flex-grow">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:max-w-2xl">
              <div className="flex items-center mb-6">
                <div className="text-[#b3b3b3] border border-[#373737] rounded-full px-3 py-1 text-sm flex items-center gap-2">
                  <span className="flex">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="#facc15"
                        stroke="#facc15"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>Never lose an idea again</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Your brain creates ideas.
                <span className="inline-block text-[#facc15]">
                  {" "}
                  We store them.
                </span>
              </h1>
              <p className="text-xl text-[#b3b3b3] mb-10 max-w-xl">
                Ever had a brilliant idea... and forgot it 10 minutes later?
                Your brain wasn&apos;t built to store ideas — it was built to
                create them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="#join-waitlist"
                  className="bg-[#facc15] hover:bg-[#fde047] text-black px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center transition-all shadow-lg hover:shadow-[#facc15]/30 hover:translate-y-[-2px]"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Join Waitlist
                </Link>
                <div className="text-[#b3b3b3] text-sm mt-2">
                  <span className="text-[#facc15]">90+</span> ideas captured by
                  our users today
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px]">
              <Image
                src="/ChatGPT Image Apr 15 2025 from Media Encoder.png"
                alt="Glowing microphone to spreadsheet"
                width={600}
                height={400}
                style={{ height: "auto" }}
                className="rounded-lg shadow-2xl shadow-[#facc15]/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-[#0d0d0d]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="bg-[#262626] p-8 rounded-xl shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#facc15] text-black rounded-full flex items-center justify-center mb-5 font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Record Your Thought
              </h3>
              <p className="text-[#b3b3b3]">
                Capture voice or video quickly through the app whenever
                inspiration strikes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#262626] p-8 rounded-xl shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#facc15] text-black rounded-full flex items-center justify-center mb-5 font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                AI-Powered Summary
              </h3>
              <p className="text-[#b3b3b3]">
                Our AI transcribes and summarizes your recordings into clear,
                actionable points.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#262626] p-8 rounded-xl shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#facc15] text-black rounded-full flex items-center justify-center mb-5 font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Save to Google Sheets
              </h3>
              <p className="text-[#b3b3b3]">
                All your ideas are automatically saved to your personal Google
                Sheet for easy access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Resonance Visual Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Your system is where ideas die
              </h2>
              <p className="text-[#b3b3b3] mb-4">
                Most ideas are lost because we don&apos;t have a reliable system
                to capture them when inspiration strikes.
              </p>
              <p className="text-[#b3b3b3] mb-6">
                T2A ensures your ideas are captured permanently, so you can
                focus on making them happen.
              </p>
              <Image
                src="/ChatGPT Image Apr 15 2025 from Media Encoder (1).png"
                alt="Frustrated person forgetting idea"
                width={400}
                height={300}
                style={{ height: "auto" }}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <Image
                src="/ChatGPT Image Apr 15 2025 from Media Encoder (2).png"
                alt="Person with organized Google Sheet"
                width={500}
                height={350}
                style={{ height: "auto" }}
                className="rounded-lg shadow-lg"
              />
              <div className="mt-10">
                <h2 className="text-3xl font-bold text-white mb-6">
                  You think Einstein kept his thoughts in his head?
                </h2>
                <p className="text-[#b3b3b3] mb-4">
                  No of course not, he wrote them down but we have something
                  better! A digital brain!
                </p>
                <p className="text-[#b3b3b3] mb-6">
                  T2A is your digital brain, capturing every thought and idea
                  you have. Eistein would have loved it!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <div id="join-waitlist">
        <WaitlistSection />
      </div>

      {/* Final CTA Section */}
      <section className="py-16 bg-[#262626]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col space-y-6">
              <h2 className="text-3xl font-bold text-white">Just T2A it.</h2>
              <p className="text-[#b3b3b3] max-w-md">
                Record, transcribe, and store your brilliant ideas with a single
                click. Never lose track of what matters most.
              </p>
              <div className="pt-4">
                <Link
                  href="#join-waitlist"
                  className="bg-[#facc15] hover:bg-[#fde047] text-black px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center transition-all shadow-lg hover:shadow-[#facc15]/30 hover:translate-y-[-2px]"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Join Waitlist
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-20 -left-10">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#facc15]"
                  >
                    <path
                      d="M13 6V3L4 14h7v7l9-11h-7z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <Image
                  src="/ChatGPT Image Apr 15 2025 from Media Encoder.png"
                  alt="T2A capture your ideas"
                  width={400}
                  height={300}
                  style={{ height: "auto" }}
                  className="rounded-lg shadow-2xl shadow-[#facc15]/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-[#b3b3b3] py-8 border-t border-[#262626]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            {/* Build in Public Badge */}
            <div className="mb-6 bg-[#262626] px-4 py-2 rounded-full text-sm inline-flex items-center">
              <span className="text-[#facc15] mr-1">🚀</span>
              <span>30-Day MVP Challenge: Building in Public</span>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-6 mb-6">
              <a
                href="https://www.instagram.com/aviinilimited/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@aviinilimited"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a
                href="https://x.com/AviniLimited"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                aria-label="X (Twitter)"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCji0gg2Vbq16XWxlVn0KygA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                aria-label="YouTube"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            <div className="text-center text-sm">
              <p>
                © {new Date().getFullYear()} Thoughts2Action. All rights
                reserved.
              </p>
              <p className="mt-2">Built with AI, shipped by vibes.</p>
              <p className="mt-2 text-xs">
                Part of a 30-day challenge to build and ship an MVP in public.
                <a
                  href="https://github.com/avini/trans-ai-journaller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-[#facc15] hover:underline"
                >
                  Follow our progress
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
