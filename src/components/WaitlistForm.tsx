"use client";

import { useState } from "react";

// Match the email regex from the server
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    name?: string;
  }>({});

  const validateInputs = () => {
    const errors: { email?: string; name?: string } = {};
    let isValid = true;

    // Validate email
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!EMAIL_REGEX.test(email.toLowerCase())) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate name (optional but with length check)
    if (name && name.length > 100) {
      errors.name = "Name must be less than 100 characters";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setIsError(false);
    setIsSuccess(false);

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name || undefined,
          source: "landing_page",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSuccess(true);
      setMessage(data.message || "Thanks for joining our waitlist!");
      setEmail("");
      setName("");
      setValidationErrors({});
    } catch (error) {
      setIsError(true);
      setMessage(
        (error as Error).message ||
          "Failed to join the waitlist. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-md">
      {isSuccess ? (
        <div className="bg-[#262626] p-6 rounded-lg shadow-md text-center">
          <div className="text-[#facc15] mb-2 text-xl">✓</div>
          <h3 className="text-white text-lg font-semibold mb-2">
            You&apos;re on the list!
          </h3>
          <p className="text-[#b3b3b3]">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[#b3b3b3] text-sm mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) {
                  setValidationErrors({
                    ...validationErrors,
                    name: undefined,
                  });
                }
              }}
              placeholder="Jane Doe"
              className={`w-full px-4 py-2 rounded-lg bg-[#262626] border ${
                validationErrors.name ? "border-red-500" : "border-[#373737]"
              } text-white focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-[#b3b3b3] text-sm mb-1"
            >
              Your Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({
                    ...validationErrors,
                    email: undefined,
                  });
                }
              }}
              placeholder="you@example.com"
              required
              className={`w-full px-4 py-2 rounded-lg bg-[#262626] border ${
                validationErrors.email ? "border-red-500" : "border-[#373737]"
              } text-white focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent`}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>

          {isError && <p className="text-red-500 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-[#facc15] hover:bg-[#fde047] text-black rounded-lg font-medium transition-colors duration-300 flex justify-center items-center ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 animate-spin">↻</span>
                Joining...
              </>
            ) : (
              "Join Waitlist"
            )}
          </button>

          <p className="text-[#b3b3b3] text-xs text-center">
            We&apos;ll never share your information with third parties.
          </p>
        </form>
      )}
    </div>
  );
}
