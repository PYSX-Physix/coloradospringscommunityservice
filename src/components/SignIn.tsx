import React from "react";
import { signIn, signUp } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signUp(email, password, name);
        alert("Account created! Please sign in.");
        setIsSignUp(false);
        setPassword(""); // Clear password after signup
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setPassword("");
    setAgreed(false);
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-[#242424]">
      <div className="w-full max-w-md bg-[#2d2d2d] border border-gray-700 rounded-lg p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">
            {isSignUp ? "Create Account" : "Sign In"}
          </h1>
          <p className="text-sm text-gray-400">
            {isSignUp ? "Sign up to create community service events!" : "Welcome back to Colorado Springs Community Service Hub!"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Do not use your real name!"
                required
                className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              Email <span className="text-red-400">*</span>
            </label>
            <input type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              Password <span className="text-red-400">*</span>
            </label>
            <input type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {isSignUp && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="mt-0.5 accent-blue-500"
              />
              <span className="text-sm text-gray-400">
                I agree to the {""}
                <a href="/policies/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a>
                {""} and {""}
                <a href="/policies/terms-of-service" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a>
              </span>
            </label>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || (isSignUp && !agreed)}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors">
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
          
          <hr className="border-gray-600"/>

          <button onClick={switchMode} className="w-full text-sm text-gray-400 hover:text-white py-2 rounded hover:bg-gray-700 transition-colors">
            { isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}