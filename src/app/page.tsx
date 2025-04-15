import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary dark:bg-secondary">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm py-4 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Replace with actual logo if available */}
            <svg
              className="w-8 h-8 text-primary dark:text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59L18 8h5v13H1V3h6zM1 14h6m-6 4h6m7-4h6"
              />
            </svg>
            <span className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
              TransAI
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
            >
              Login / Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white dark:from-gray-800 to-secondary dark:to-secondary pt-20 pb-28 flex-grow flex items-center">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Unlock Insights from Your Audio & Video
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Effortlessly transcribe media, extract key points with AI, and
              export directly to Google Sheets. Focus on what matters, faster.
            </p>
            <Link
              href="/login"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full text-lg font-semibold inline-block transition-colors shadow-lg transform hover:scale-105"
            >
              Start Analyzing Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-16">
            Streamline Your Workflow
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-secondary dark:bg-gray-700 p-8 rounded-xl shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Easy Upload
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Securely upload various audio and video file formats directly
                from your browser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-secondary dark:bg-gray-700 p-8 rounded-xl shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Leverage cutting-edge AI for accurate transcription and
                insightful summaries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-secondary dark:bg-gray-700 p-8 rounded-xl shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Sheets Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically export extracted points and timestamps to Google
                Sheets for easy access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">TransAI</h3>
              <p className="text-sm">
                Transforming media into actionable insights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://youtube.com/channel/UCji0gg2Vbq16XWxlVn0KygA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    YouTube
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/avinistore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ce20480"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} TransAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
