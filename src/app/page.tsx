import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
      {/* Navigation */}
      <nav className="bg-[#1a1a1a]/80 backdrop-blur-md py-4 sticky top-0 z-50 border-b border-[#262626]">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold text-white group-hover:text-[#facc15] transition-colors duration-300">
              T2A
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="#how-it-works"
              className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/login"
              className="bg-[#facc15] hover:bg-[#fde047] text-black px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Start Capturing
            </Link>
          </div>
        </div>
      </nav>

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
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Turn your thoughts into
                <span className="inline-block bg-[#262626] px-4 py-1 mx-2">
                  action
                </span>
              </h1>
              <p className="text-xl text-[#b3b3b3] mb-10 max-w-xl">
                Capture fleeting thoughts via voice or video, use AI to
                summarize, and save them permanently in Google Sheets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="/login"
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
                  Start Capturing
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
                Never lose a brilliant idea again
              </h2>
              <p className="text-[#b3b3b3] mb-4">
                We&apos;ve all felt that frustration of forgetting a great idea
                that came to us in the shower, on a walk, or while falling
                asleep.
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
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-[#262626]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-white mb-8">Just T2A it.</h2>
            <Link
              href="/login"
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
              Start Capturing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-[#b3b3b3] py-8 border-t border-[#262626]">
        <div className="container mx-auto px-6">
          <div className="text-center text-sm">
            <p>
              © {new Date().getFullYear()} Thoughts2Action. All rights reserved.
            </p>
            <p className="mt-2">Built with AI, shipped by vibes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
