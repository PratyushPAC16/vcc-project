import { BookOpenCheck, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import ActionButton from "../components/ui/ActionButton";
import Toast from "../components/ui/Toast";
import { loginRequest, registerRequest } from "../features/auth/auth.service";
import { readAuth, writeAuth } from "../features/auth/auth.storage";

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
      setToast((current) => ({ ...current, show: false }));
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast.show]);

  function showToast(messageText, tone = "info") {
    setToast({ show: true, message: messageText, tone });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
      <main className="mx-auto grid min-h-screen w-[min(1240px,95vw)] gap-8 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <section className="animate-rise rounded-[34px] border border-[#cfd9ea] bg-[#f3f7ff]/90 p-8 shadow-[0_28px_70px_rgba(31,42,68,0.2)] backdrop-blur sm:p-10">
          <p className="inline-flex rounded-full border border-[#bdcce8] bg-[#e9eff8] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#485f8f]">
            Student Portal
          </p>
          <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-[#1f2a44] sm:text-7xl">
            My Courses
            <span className="block text-[#3e5482]">Command Center</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#5f6b86]">
            Track enrollment progress, manage course plans, and update your semester data from one clean workspace.
          </p>
          <div className="mt-8 h-1 w-36 rounded-full bg-gradient-to-r from-[#2f3f69] via-[#6d85b5] to-[#c6d4ee]" />
          <div className="mt-6">
            <ActionButton variant="subtle" onClick={() => navigate("/dashboard")}>
              <span className="inline-flex items-center gap-2">
                <LayoutDashboard size={16} /> Open Dashboard Demo
              </span>
            </ActionButton>
          </div>
        </section>

        <div>
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
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4f5e80]">
            <BookOpenCheck size={14} /> React + Vite + Tailwind + Lucide
          </p>
        </div>
      </main>
    </>
  );
}
