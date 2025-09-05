"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const messages = {
    OAuthSignin: "Could not connect to Google.",
    OAuthCallback: "Problem signing in with Google.",
    OAuthCreateAccount: "Unable to create your account.",
    EmailCreateAccount: "Email account creation failed.",
    Callback: "OAuth callback failed.",
    OAuthAccountNotLinked:
      "This email is already linked to another login method. Try your original sign-in option.",
    EmailSignin: "Could not send email sign-in link.",
    CredentialsSignin: "Invalid email or password.",
    default: "An unexpected error occurred. Please try again.",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700">
          {messages[error] || messages.default}
        </p>
        <a
          href="/SignInPage"
          className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
