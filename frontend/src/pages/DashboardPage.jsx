import {
  ChevronRight,
  ClipboardList,
  Grid2x2,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseForm from "../components/courses/CourseForm";
import CourseModal from "../components/courses/CourseModal";
import ActionButton from "../components/ui/ActionButton";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Notice from "../components/ui/Notice";
import { logoutRequest } from "../features/auth/auth.service";
import { clearAuth, readAuth } from "../features/auth/auth.storage";
import {
  createCourse,
  getCourseById,
  getCourses,
  removeCourse,
  updateCourse,
} from "../features/courses/course.service";
import { DEMO_COURSES } from "../features/courses/demo.data";

const EMPTY_FORM = {
  id: "",
  title: "",
  details: "",
  semester: "",
  enrollstatus: "Enrolled",
};

const SIDEBAR_ITEMS = [
  { key: "all", label: "All Courses", icon: Grid2x2 },
  { key: "completed", label: "Not Enrolled", icon: ClipboardList },
  { key: "pending", label: "Enrolled", icon: ClipboardList },
  { key: "sticky", label: "Sticky Wall", icon: StickyNote },
  { key: "settings", label: "Settings", icon: Settings },
];

function validateCourse(course) {
  return (
    String(course.title || "").trim() &&
    String(course.details || "").trim() &&
    String(course.semester || "").trim()
  );
}

function resolveDemoMessage(error) {
  const rawMessage = String(error?.message || "").toLowerCase();

  if (
    rawMessage.includes("failed to fetch") ||
    rawMessage.includes("network") ||
    rawMessage.includes("fetch")
  ) {
    return "Live backend is unavailable. If MONGODB_URI is not configured, backend startup will fail. Demo data is enabled for review.";
  }

  if (rawMessage.includes("unable to fetch courses")) {
    return "Unable to fetch courses from live API. If MONGODB_URI is missing, run demo mode from the login page using Open Dashboard Demo.";
  }

  return error?.message || "Unable to load live courses. Demo data is enabled for UI review.";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const auth = readAuth();

  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("myCoursesTheme");
    return stored === "dark" ? "dark" : "light";
  });
  const [demoMode, setDemoMode] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [listMessage, setListMessage] = useState({ text: "", tone: "error" });
  const [formMessage, setFormMessage] = useState({ text: "", tone: "error" });
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, courseId: null });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalCourse, setModalCourse] = useState(null);

  const isEditing = Boolean(formState.id);

  const headingText = useMemo(() => {
    if (auth?.username) {
      return `Welcome, ${auth.username}. Manage your courses below.`;
    }
    return "Frontend preview mode is active while login integration is pending.";
  }, [auth]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("myCoursesTheme", theme);
  }, [theme]);

  const normalizedCourses = useMemo(
    () =>
      courses.map((course) => {
        const enrollStatus = String(
          course.enrollstatus || course.enrollStatus || course.status || "Enrolled"
        ).trim();
        const completed = enrollStatus.toLowerCase() === "not enrolled";

        return {
          ...course,
          completed,
          status: completed ? "Not Enrolled" : "Enrolled",
          task: course.title || course.task || "",
          description: course.details || course.description || "",
          dueDate: course.semester || course.dueDate || "",
        };
      }),
    [courses]
  );

  const tabCounts = useMemo(() => {
    const completed = normalizedCourses.filter((course) => course.completed).length;
    const pending = normalizedCourses.filter((course) => !course.completed).length;
    return { completed, pending, all: normalizedCourses.length };
  }, [normalizedCourses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const byTab = (() => {
      if (activeTab === "completed") {
        return normalizedCourses.filter((course) => course.completed);
      }
      if (activeTab === "pending") {
        return normalizedCourses.filter((course) => !course.completed);
      }
      return normalizedCourses;
    })();

    if (!query) {
      return byTab;
    }

    return byTab.filter((course) => {
      const titleText = String(course.title || course.task || "").toLowerCase();
      const detailsText = String(course.details || course.description || "").toLowerCase();
      const semesterText = String(course.semester || course.dueDate || "").toLowerCase();
      const statusText = String(course.status || "").toLowerCase();
      return (
        titleText.includes(query) ||
        detailsText.includes(query) ||
        semesterText.includes(query) ||
        statusText.includes(query)
      );
    });
  }, [normalizedCourses, activeTab, searchQuery]);

  const viewTitle = useMemo(() => {
    if (activeTab === "completed") return "Not Enrolled Courses";
    if (activeTab === "pending") return "Enrolled Courses";
    return "All Courses";
  }, [activeTab]);

  function activateDemoMode(message) {
    setDemoMode(true);
    setCourses(
      DEMO_COURSES.map((item) => ({
        id: item.id,
          title: item.title || item.task,
          details: item.details || item.description,
          semester: item.semester || item.dueDate || "Spring 2026",
          enrollstatus: String(item.enrollstatus || item.enrollStatus || "").toLowerCase().includes("not")
            ? "Not Enrolled"
            : "Enrolled",
      }))
    );
    setListMessage({
      text:
        message ||
        "Protected API requires login. Demo data is enabled for UI review.",
      tone: "info",
    });
  }

  async function loadCourseList() {
    setLoadingCourses(true);
    setListMessage({ text: "", tone: "error" });

    try {
      const result = await getCourses();
      setDemoMode(false);
      setCourses(result);
    } catch (error) {
      if (error.code === 401 || error.message === "Unauthorized") {
        activateDemoMode(
          "Protected API requires login. Demo data is enabled for UI review."
        );
      } else {
        activateDemoMode(resolveDemoMessage(error));
      }
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    loadCourseList();
  }, []);

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setFormState(EMPTY_FORM);
    setFormMessage({ text: "", tone: "error" });
  }

  function startEdit(course) {
    setFormState({
      id: course.id,
        title: course.title || course.task || "",
        details: course.details || course.description || "",
        semester: course.semester || course.dueDate || "",
        enrollstatus:
          course.enrollstatus || course.enrollStatus || (course.completed ? "Not Enrolled" : "Enrolled"),
    });
    setFormMessage({ text: "", tone: "error" });
    setModalCourse(course);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function requestDelete(courseId) {
    setDeleteConfirm({ open: true, courseId });
  }

  function closeDeleteConfirm() {
    setDeleteConfirm({ open: false, courseId: null });
  }

  async function handleDelete(courseId) {
    if (!courseId) return;

    setListMessage({ text: "", tone: "error" });
    setLoadingDelete(true);

    if (demoMode) {
      setCourses((current) => current.filter((course) => course.id !== courseId));
      setListMessage({ text: "Course deleted in demo mode.", tone: "success" });
      if (formState.id === courseId) resetForm();
      setLoadingDelete(false);
      return;
    }

    try {
      await removeCourse(courseId);
      await loadCourseList();
      setListMessage({ text: "Course deleted successfully.", tone: "success" });
      if (formState.id === courseId) resetForm();
    } catch (error) {
      if (error.code === 401 || error.message === "Unauthorized") {
        activateDemoMode(
          "Protected API requires login. Demo data is enabled for UI review."
        );
      } else {
        setListMessage({
          text: error.message || "Unable to delete course.",
          tone: "error",
        });
      }
    } finally {
      setLoadingDelete(false);
    }
  }

  async function confirmDelete() {
    const selectedCourseId = deleteConfirm.courseId;
    closeDeleteConfirm();
    await handleDelete(selectedCourseId);
  }

  async function handleView(courseId) {
    setModalMessage("");

    if (demoMode) {
      const selected = courses.find((item) => item.id === courseId);
      if (!selected) {
        setListMessage({ text: "Unable to view course.", tone: "error" });
        return;
      }
      setModalCourse(selected);
      setModalOpen(true);
      return;
    }

    try {
      const selected = await getCourseById(courseId);
      setModalCourse(selected);
      setModalOpen(true);
    } catch (error) {
      if (error.code === 401 || error.message === "Unauthorized") {
        activateDemoMode(
          "Protected API requires login. Demo data is enabled for UI review."
        );
      } else {
        setModalMessage(error.message || "Unable to load selected course.");
        setModalOpen(true);
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormMessage({ text: "", tone: "error" });

    if (!validateCourse(formState)) {
      setFormMessage({ text: "Please fill in all fields.", tone: "error" });
      return;
    }

    setLoadingSave(true);

    if (demoMode) {
      if (isEditing) {
        setCourses((current) =>
          current.map((item) => (item.id === formState.id ? { ...formState } : item))
        );
      } else {
        setCourses((current) => [
          { ...formState, id: `demo-${Date.now()}` },
          ...current,
        ]);
      }
      setLoadingSave(false);
      resetForm();
      setFormMessage({
        text: isEditing
          ? "Course updated in demo mode."
          : "Course added in demo mode.",
        tone: "success",
      });
      return;
    }

    try {
      if (isEditing) {
        await updateCourse(formState);
      } else {
        await createCourse(formState);
      }
      await loadCourseList();
      setFormMessage({
        text: isEditing ? "Course updated successfully." : "Course added successfully.",
        tone: "success",
      });
      resetForm();
    } catch (error) {
      if (error.code === 401 || error.message === "Unauthorized") {
        activateDemoMode(
          "Protected API requires login. Demo data is enabled for UI review."
        );
      } else {
        setFormMessage({ text: error.message || "Unable to save course.", tone: "error" });
      }
    } finally {
      setLoadingSave(false);
    }
  }

  async function handleLogout() {
    clearAuth();
    try {
      await logoutRequest();
    } catch {
      // local auth is already cleared
    }
    navigate("/");
  }

  return (
    <main className="min-h-screen w-full px-2 py-2 sm:px-5 sm:py-5">
      <section
        className={`animate-rise min-h-[calc(100vh-1.25rem)] w-full overflow-hidden rounded-[34px] border shadow-[0_38px_90px_rgba(31,42,68,0.26)] transition-colors duration-300 lg:grid lg:grid-cols-[250px_1fr_390px] ${
          theme === "dark" ? "border-[#2d3b57] bg-[#131d30]" : "border-[#cfd8e9] bg-[#f2f6fd]"
        }`}
      >
        <aside
          className={`flex flex-col border-b px-5 py-6 lg:border-b-0 lg:border-r ${
            theme === "dark" ? "border-[#2d3b57] bg-[#19253b]" : "border-[#d8e1f1] bg-[#ecf1fa]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="brand-title text-3xl font-extrabold leading-tight">TWISTY</h2>
              <p
                className={`mt-1 text-xs font-semibold tracking-[0.04em] ${
                  theme === "dark" ? "text-[#98abcf]" : "text-[#627394]"
                }`}
              >
                Course Workspace
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                theme === "dark" ? "bg-[#243654] text-[#e7eeff]" : "bg-[#dce5f4] text-[#34466d]"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <p
            className={`mt-7 text-xs font-bold uppercase tracking-[0.12em] ${
              theme === "dark" ? "text-[#91a2c1]" : "text-[#7384a5]"
            }`}
          >
            Course Status
          </p>
          <nav className="mt-2 space-y-1">
            {SIDEBAR_ITEMS.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const tabKey = item.key;
              const active = activeTab === tabKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 hover:translate-x-0.5 ${
                    active
                      ? theme === "dark"
                        ? "bg-[#253959] font-bold text-[#f1f5ff]"
                        : "bg-[#dbe5f4] font-bold text-[#23355a]"
                      : theme === "dark"
                      ? "text-[#b5c3de]"
                      : "text-[#5a6b8d]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon size={14} /> {item.label}
                  </span>
                  <span className={`${theme === "dark" ? "text-[#8fa1c4]" : "text-[#7b8eaf]"} text-xs`}>
                    {tabKey === "completed" ? tabCounts.completed : tabKey === "pending" ? tabCounts.pending : tabCounts.all}
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            className={`mt-8 rounded-2xl border p-4 text-sm shadow-sm ${
              theme === "dark"
                ? "border-[#2f4265] bg-[#15233a] text-[#b3c4e3]"
                : "border-[#cad5e8]/70 bg-[#f7f9fe]/70 text-[#5f7093]"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.1em]">Overview</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span>Not Enrolled</span>
                <span className="font-bold">{tabCounts.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Enrolled</span>
                <span className="font-bold">{tabCounts.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Courses</span>
                <span className="font-bold">{tabCounts.all}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-auto">
            <ActionButton variant="ghost" className="w-full" onClick={handleLogout}>
              <span className="inline-flex items-center gap-2">
                <LogOut size={14} /> Sign out
              </span>
            </ActionButton>
          </div>
        </aside>

        <section
          className={`border-b px-4 py-5 lg:border-b-0 lg:border-r sm:px-6 ${
            theme === "dark" ? "border-[#2d3b57] bg-[#17243b]" : "border-[#d8e1f1] bg-[#f5f8ff]"
          }`}
        >
          <div
            className={`flex flex-wrap items-center gap-3 rounded-2xl border px-3 py-2 shadow-sm ${
              theme === "dark" ? "border-[#314664] bg-[#1a2a45]" : "border-[#d4dced] bg-[#f9fbff]"
            }`}
          >
            <div className="flex items-center gap-1 pr-2">
              <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#344b77]">
                Home
              </button>
              <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#6a7da2]">
                Projects
              </button>
              <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#6a7da2]">
                Wallet
              </button>
            </div>
            <div
              className={`ml-auto flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2 ${
                theme === "dark" ? "border-[#385177] bg-[#1c2e4a]" : "border-[#d4dced] bg-white"
              }`}
            >
              <Search size={14} className={theme === "dark" ? "text-[#9eb0d0]" : "text-[#7c8eb0]"} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Enter your search request..."
                className={`w-full bg-transparent text-sm outline-none ${
                  theme === "dark" ? "text-[#e8efff] placeholder:text-[#91a4c7]" : "text-[#314466] placeholder:text-[#90a0bd]"
                }`}
              />
            </div>
          </div>

          <h1 className="page-title mt-5 text-4xl font-extrabold sm:text-5xl">{viewTitle}</h1>
          <p className="title-support mt-2 text-sm">Track changes in course enrollment and quickly open any course for editing.</p>

          <button
            type="button"
            onClick={() => setFormState(EMPTY_FORM)}
            className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
              theme === "dark" ? "border-[#43608d] bg-[#203353] text-[#deebff]" : "border-[#c7d4ea] bg-[#e3ebf9] text-[#29406a]"
            }`}
          >
            <Plus size={14} /> Create Course
          </button>

          <div className="mt-4">
            <Notice message={listMessage.text} tone={listMessage.tone} />
          </div>

          {demoMode && (
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f5ead2] px-3 py-1 text-xs font-bold uppercase tracking-[0.11em] text-[#9a6a00]">
              <Sparkles size={13} /> Demo Mode
            </span>
          )}

          <div
            className={`mt-3 divide-y rounded-2xl border shadow-sm ${
              theme === "dark" ? "divide-[#324a70] border-[#324a70] bg-[#1b2c47]" : "divide-[#dce4f3] border-[#d8e1f1] bg-[#fcfdff]"
            }`}
          >
            {loadingCourses && (
              <div className={`px-4 py-4 text-sm ${theme === "dark" ? "text-[#b7c7e2]" : "text-[#6f81a3]"}`}>Loading courses...</div>
            )}
            {!loadingCourses && filteredCourses.length === 0 && (
              <div className={`px-4 py-4 text-sm ${theme === "dark" ? "text-[#b7c7e2]" : "text-[#6f81a3]"}`}>
                {searchQuery.trim() ? "No courses match your search in this view." : "No courses yet. Create one from the right panel."}
              </div>
            )}
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => startEdit(course)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-all duration-200 ${
                  theme === "dark" ? "hover:bg-[#22385a] hover:pl-5" : "hover:bg-[#f1f5fc] hover:pl-5"
                }`}
              >
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${theme === "dark" ? "text-[#f0f4ff]" : "text-[#23365b]"}`}>{course.title || course.task}</p>
                  <p className={`mt-1 truncate text-xs ${theme === "dark" ? "text-[#a8bbde]" : "text-[#7488ad]"}`}>
                    {course.semester || course.dueDate || "No semester"} • {course.enrollstatus || course.enrollStatus || course.status}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 ${theme === "dark" ? "text-[#9fb3d8]" : "text-[#8095ba]"}`}>
                  <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <ActionButton variant="subtle" onClick={loadCourseList} disabled={loadingCourses}>
              Refresh
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => formState.id && handleView(formState.id)} disabled={!formState.id}>
              View Selected
            </ActionButton>
            <ActionButton variant="danger" onClick={() => formState.id && requestDelete(formState.id)} disabled={!formState.id || loadingDelete}>
              Delete
            </ActionButton>
          </div>
        </section>

        <section className={`px-4 py-5 sm:px-6 ${theme === "dark" ? "bg-[#13233b]" : "bg-[#f1f5fd]"}`}>
          <h2 className="panel-title text-3xl font-extrabold sm:text-4xl">Course</h2>
          <p className="title-support mt-1 text-sm">{headingText}</p>

          <div className="mt-4">
            <CourseForm
              theme={theme}
              mode={isEditing ? "edit" : "create"}
              values={formState}
              loading={loadingSave}
              message={formMessage.text}
              messageTone={formMessage.tone}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          </div>
        </section>
      </section>

      <CourseModal
        open={modalOpen}
        course={modalCourse}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          setModalMessage("");
          setModalCourse(null);
        }}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete this course?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={loadingDelete}
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
