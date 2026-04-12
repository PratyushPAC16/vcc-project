import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import ActionButton from "../ui/ActionButton";
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
    <section className="animate-rise rounded-[30px] border border-[#d6dfef] bg-[#f8fbff]/95 p-7 shadow-[0_26px_60px_rgba(31,42,68,0.22)] backdrop-blur">
      <h2 className="text-3xl font-bold tracking-tight text-[#1f2a44]">
        {isSignup ? "Create Account" : "Login"}
      </h2>
      <p className="mt-2 text-sm text-[#5f6b86]">
        {isSignup
          ? "Register with your email and a strong password."
          : "Sign in to continue with your account."}
      </p>

      <div className="mt-4 flex gap-2 rounded-2xl bg-[#e9eff8] p-1 ring-1 ring-[#d0d9ea]">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={`w-full rounded-xl px-3 py-2 text-sm font-semibold ${
            !isSignup ? "bg-[#2f3f69] text-[#eef2ff]" : "text-[#4a5877]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className={`w-full rounded-xl px-3 py-2 text-sm font-semibold ${
            isSignup ? "bg-[#2f3f69] text-[#eef2ff]" : "text-[#4a5877]"
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="mt-5">
        <Notice message={message} />
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-[#4f5e80]">
          Email
          <span className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#d4dced]">
            <User size={16} className="text-[#7a87a5]" />
            <input
              name="email"
              type="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="w-full bg-transparent text-sm text-[#243252] outline-none placeholder:text-[#9aa7c2]"
            />
          </span>
        </label>

        <label className="block text-sm font-semibold text-[#4f5e80]">
          Password
          <span className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#d4dced]">
            <Lock size={16} className="text-[#7a87a5]" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={onChange}
              placeholder={isSignup ? "Create a strong password" : "Enter your password"}
              className="w-full bg-transparent text-sm text-[#243252] outline-none placeholder:text-[#9aa7c2]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="text-[#7a87a5] transition-colors hover:text-[#4a5877]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
          {isSignup && (
            <span className="mt-2 block text-xs font-medium text-[#66779a]">
              Use at least 8 characters with uppercase, lowercase, number, and special character.
            </span>
          )}
        </label>

        <ActionButton type="submit" className="w-full" disabled={loading}>
          <span className="inline-flex items-center gap-2">
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
                ? "Create Account"
                : "Login"}
            <ArrowRight size={16} />
          </span>
        </ActionButton>
      </form>
    </section>
  );
}
