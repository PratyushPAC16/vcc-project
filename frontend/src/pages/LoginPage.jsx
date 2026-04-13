import { BookOpen, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import Toast from "../components/ui/Toast";
import { loginRequest, registerRequest } from "../features/auth/auth.service";
import { readAuth, writeAuth } from "../features/auth/auth.storage";

const STATS = [
  { icon: BookOpen, label: "Courses Tracked", value: "12+" },
  { icon: Users, label: "Active Sessions", value: "1" },
  { icon: TrendingUp, label: "Enrollment Rate", value: "94%" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", tone: "info" });

  useEffect(() => {
    const auth = readAuth();
    if (auth?.username || auth?.email) navigate("/dashboard", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!toast.show) return undefined;
    const timer = window.setTimeout(() => {
      setToast((c) => ({ ...c, show: false }));
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [toast.show]);

  function showToast(messageText, tone = "info") {
    setToast({ show: true, message: messageText, tone });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((c) => ({ ...c, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    if (!email || !password) {
      setMessage("Email and password are required.");
      showToast("Email and password are required.", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await registerRequest(email, password);
        showToast("Account created successfully. Signing you in...", "success");
      }
      const result = await loginRequest(email, password);
      const currentEmail = result?.user?.email || result?.user?.username || email;
      writeAuth({
        username: currentEmail,
        email: currentEmail,
        loggedInAt: new Date().toISOString(),
      });
      showToast("Login successful.", "success");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error.message || "Authentication failed.";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toast toast={toast} />
      {/* ── Page wrapper ── */}
      <div
        className="min-h-screen w-full flex flex-col bg-[#f0f3fa]"
      >
        {/* ── Top Navbar — mirrors dashboard nav ── */}
        <nav
          className="flex items-center gap-4 border-b border-[#dde3ef] px-6 py-3 w-full"
          style={{ background: "#f8f9fd" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-extrabold text-sm"
              style={{ background: "#e05a2b" }}
            >
              M
            </div>
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ color: "#1a263f", fontFamily: "'Sora', sans-serif" }}
            >
              Mentorly
            </span>
          </div>

          {/* Nav links */}
          <div className="ml-6 hidden items-center gap-1 sm:flex">
            {["Dashboard", "My Courses", "Enrollment", "Progress"].map((link, i) => (
              <span
                key={link}
                className="rounded-lg px-3.5 py-1.5 text-sm"
                style={
                  i === 0
                    ? { color: "#1f2a44", fontWeight: 700, background: "#eef1f9", borderRadius: 8 }
                    : { color: "#6a7da2", fontWeight: 500 }
                }
              >
                {link}
              </span>
            ))}
          </div>

          <div className="ml-auto">
            <span className="rounded-full border border-[#d4dced] bg-white px-4 py-1.5 text-sm font-semibold text-[#374466]">
              Student Portal
            </span>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="flex flex-1 w-full">
          <div
            className="animate-rise w-full flex flex-col flex-1"
            style={{ background: "#f0f3fa" }}
          >
            <div className="grid lg:grid-cols-[1fr_420px] flex-1">
              {/* ── Left: Hero panel ── */}
              <div
                className="flex flex-col justify-between p-8 sm:p-12"
                style={{ background: "#f4f7fe" }}
              >
                {/* Hero text */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#8899b8]">
                    Course Overview
                  </p>
                  <h1
                    className="mt-3 text-5xl sm:text-6xl font-extrabold leading-[1.0] tracking-tight"
                    style={{ color: "#1a263f", fontFamily: "'Sora', sans-serif" }}
                  >
                    My Courses
                    <br />
                    <span style={{ color: "#3d5180" }}>Command</span>
                    <br />
                    Center
                  </h1>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-[#6b7d9e]">
                    Track enrollment progress, manage course plans, and update your semester data from one calm workspace.
                  </p>

                  {/* Divider accent */}
                  <div
                    className="mt-6 h-1 w-32 rounded-full"
                    style={{ background: "linear-gradient(90deg, #2b3d62, #6d85b5, #c6d4ee)" }}
                  />

                  {/* Stats row */}
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {STATS.map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl p-4"
                        style={{ background: "#e8edf8" }}
                      >
                        <Icon size={16} className="text-[#5a6e92]" />
                        <p className="mt-2 text-xl font-extrabold text-[#1a263f]">{value}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#8899b8] leading-4">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo button */}
                <div className="mt-10">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #2b3d62, #4a6099)" }}
                  >
                    <LayoutDashboard size={15} />
                    Open Dashboard Demo
                  </button>
                  <p className="mt-3 text-xs text-[#9aabca]">
                    No login required for demo mode
                  </p>
                </div>
              </div>

              {/* ── Right: Login / Signup form ── */}
              <div
                className="flex flex-col justify-center border-l border-[#dde3ef] p-8"
                style={{ background: "#f8f9fd" }}
              >
                <LoginForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  message={message}
                  email={form.email}
                  password={form.password}
                  onChange={handleChange}
                  mode={mode}
                  onModeChange={setMode}
                />

                <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8899b8]">
                  <BookOpen size={13} />
                  React + Vite + Tailwind + Lucide
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
