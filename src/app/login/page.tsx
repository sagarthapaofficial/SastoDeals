"use client"; // Indicates this component is client-side rendered
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import Image from "next/image"; // For optimized image rendering
import { supabase } from "@/app/supabaseClient"; // Supabase client for authentication
import { ToastContainer, toast } from "react-toastify"; // For notifications
import "react-toastify/dist/ReactToastify.css"; // Toastify styles

const Login: React.FC = () => {
  // State variables
  const [isEmailLogin, setIsEmailLogin] = useState<boolean>(false); // Tracks if email login is active
  const [isFinishLogin, setIsFinishLogin] = useState<boolean>(false); // Tracks if verification step is active
  const [email, setEmail] = useState<string>(""); // Stores the user's email
  const [verificationCode, setVerificationCode] = useState<string>(""); // Stores the verification code
  const [user, setUser] = useState<{ email: string } | null>(null); // Tracks the logged-in user
  const router = useRouter(); // For navigation

  // Effect to listen for authentication state changes
  //This runs when the component mounts/renders and runs when any dependecies change
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      //subscribing to the auth state change from supabase
      async (event, session) => {
        if (session?.user) {
          // If a user is logged in, set the user state
          if (session.user.email) {
            setUser({ email: session.user.email });
          } else {
            console.error("User email is undefined");
          }
        } else {
          // If no user is logged in, clear the user state
          setUser(null);
        }
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again."); // Show error notification
    } else {
      toast.success("Logged out successfully!"); // Show success notification
      router.push("/login"); // Redirect to login page
    }
  };

  // Handlers for toggling login states
  const handleEmailLogin = () => setIsEmailLogin(true); // Activate email login
  const handleFinishLogin = () => setIsFinishLogin(true); // Activate verification step

  const handleBack = () => {
    // Handle back button functionality
    if (isFinishLogin) {
      setIsFinishLogin(false); // Go back to email login
    } else {
      setIsEmailLogin(false); // Go back to main login options
    }
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Error logging in with Google:", error);
      toast.error("Error logging in with Google. Please try again.");
    } else {
      toast.success("Logged in with Google successfully!");
    }
  };

  // Microsoft login handler
  const handleMicrosoftLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
    });
    if (error) {
      console.error("Error logging in with Microsoft:", error);
      toast.error("Error logging in with Microsoft. Please try again.");
    } else {
      toast.success("Logged in with Microsoft successfully!");
    }
  };

  //Handles keyPress on Email input field
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleEmailSubmit();
    }
  };

  // Email login handler
  const handleEmailSubmit = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error("Error sending email verification:", error);
      toast.error("Error sending verification email. Please try again.");
    } else {
      window.localStorage.setItem("emailForSignIn", email); // Store email locally
      toast.success("Verification email sent. Please check your inbox.");
      setEmail(""); // Clear the email field
      handleFinishLogin(); // Move to verification step
    }
  };

  // Verification code submission handler
  const handleVerificationSubmit = async () => {
    const storedEmail = window.localStorage.getItem("emailForSignIn");
    if (!storedEmail) {
      toast.error("No email found. Please try logging in again.");
      return;
    }

    //Verifies the OTP code sent to the user's email
    const { error } = await supabase.auth.verifyOtp({
      email: storedEmail,
      token: verificationCode,
      type: "magiclink",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid verification code. Please try again.");
    } else {
      toast.success("Successfully logged in!");
      router.push("/"); // Redirect to home page
    }
  };

  // Render the login component
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/brandlogo/heroImage.jpeg')" }}
    >
      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md bg-black shadow-md rounded-lg p-6 bg-opacity-90 backdrop-blur-md relative">
        {user ? (
          // Profile menu for logged-in user
          <div className="flex flex-col items-center">
            <Image
              src="/images/brandlogo/profileIcon.png"
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full mb-4"
            />
            <h2 className="text-white text-lg font-bold mb-2">
              Welcome, {user.email}
            </h2>
            <button
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          // Login options
          <>
            {(isEmailLogin || isFinishLogin) && (
              <button
                className="absolute top-4 left-4 text-white"
                onClick={handleBack}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/brandlogo/logo.png"
                alt="Sasto Deals"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
            {isFinishLogin ? (
              // Verification step

              <div>
                <h1 className="text-2xl font-bold text-center mb-4 text-white">
                  Finish Logging In
                </h1>
                <p className="text-center text-white mb-6">
                  Once you enter the code we sent to your email, you’ll be
                  allowed to log in.
                </p>
                <div className="space-y-4">
                  <label className="block text-white">Code</label>
                  <input
                    type="text"
                    placeholder="Enter Code"
                    value={verificationCode}
                    onKeyDown={handleVerificationSubmit}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                    onClick={handleVerificationSubmit}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : isEmailLogin ? (
              // Email login step
              <div>
                <h1 className="text-2xl font-bold text-center mb-4 text-white">
                  Continue with email
                </h1>
                <p className="text-center text-white mb-6">
                  We’ll check if you have an account, and help create one if you
                  don’t.
                </p>
                <div className="space-y-4">
                  <label className="block text-white">
                    Email (personal or work)
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                    onClick={handleEmailSubmit}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              // Main login options
              <div>
                <h1 className="text-2xl font-bold text-center mb-4 text-white">
                  Log in or sign up in seconds
                </h1>
                <p className="text-center text-white mb-6">
                  Use your email or another service to continue with Sasto Deals
                  (it&apos;s free)!
                </p>
                <div className="space-y-4">
                  <button
                    className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-50"
                    onClick={handleGoogleLogin}
                  >
                    <Image
                      src="/images/brandlogo/googleIcon.png"
                      alt="Google"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    Continue with Google
                  </button>
                  <button
                    className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-50"
                    onClick={handleMicrosoftLogin}
                  >
                    <Image
                      src="/images/brandlogo/microsoftIcon.png"
                      alt="Microsoft"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    Continue with Microsoft
                  </button>
                  <button
                    className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-50"
                    onClick={handleEmailLogin}
                  >
                    <Image
                      src="/images/brandlogo/email.png"
                      alt="Email"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    Continue with Email
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
