import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import Notice from "../ui/Notice";

export default function LoginForm({
  onSubmit,
  loading,
  message,
  email,
  password,
  onChange,
  mode,
  onModeChange,
}) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Header */}
      <h2
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: "#1a263f", fontFamily: "'Sora', sans-serif" }}
      >
        {isSignup ? "Create Account" : "Welcome Back"}
      </h2>
      <p className="mt-1.5 text-sm text-[#6b7d9e]">
        {isSignup
          ? "Register with your email to get started."
          : "Sign in to continue to your workspace."}
      </p>

      {/* Mode toggle — matches dashboard filter tab pill style */}
      <div
        className="mt-5 flex gap-1.5 rounded-full p-1"
        style={{ background: "#e6ecf5" }}
      >
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className="flex-1 rounded-full py-2 text-sm font-semibold transition-all"
          style={
            !isSignup
              ? { background: "#1a263f", color: "#fff" }
              : { color: "#5a6a8a" }
          }
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className="flex-1 rounded-full py-2 text-sm font-semibold transition-all"
          style={
            isSignup
              ? { background: "#1a263f", color: "#fff" }
              : { color: "#5a6a8a" }
          }
        >
          Sign Up
        </button>
      </div>

      {/* Error / info notice */}
      {message && (
        <div className="mt-4">
          <Notice message={message} />
        </div>
      )}

      {/* Form */}
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        {/* Email field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8899b8]"
          >
            Email
          </label>
          <div
            className="mt-2 flex items-center gap-2.5 rounded-2xl border border-[#dde3ef] bg-white px-4 py-3 transition focus-within:border-[#4a6099] focus-within:shadow-sm"
          >
            <User size={15} className="shrink-0 text-[#8fa0be]" />
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="w-full bg-transparent text-sm text-[#1a263f] outline-none placeholder:text-[#b0bdd4]"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8899b8]"
          >
            Password
          </label>
          <div
            className="mt-2 flex items-center gap-2.5 rounded-2xl border border-[#dde3ef] bg-white px-4 py-3 transition focus-within:border-[#4a6099] focus-within:shadow-sm"
          >
            <Lock size={15} className="shrink-0 text-[#8fa0be]" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={onChange}
              placeholder={isSignup ? "Create a strong password" : "Enter your password"}
              className="w-full bg-transparent text-sm text-[#1a263f] outline-none placeholder:text-[#b0bdd4]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="shrink-0 text-[#8fa0be] transition hover:text-[#4a6099]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {isSignup && (
            <p className="mt-1.5 text-xs text-[#9aabca]">
              At least 8 characters with uppercase, number &amp; special character.
            </p>
          )}
        </div>

        {/* Submit button — same gradient as dashboard "Add New Course" */}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          style={{ background: "linear-gradient(135deg, #2b3d62, #4a6099)" }}
        >
          {loading
            ? isSignup
              ? "Creating account..."
              : "Signing in..."
            : isSignup
            ? "Create Account"
            : "Login"}
          {!loading && <ArrowRight size={15} />}
        </button>
      </form>
    </div>
  );
}
