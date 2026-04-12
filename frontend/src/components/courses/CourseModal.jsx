import { X } from "lucide-react";
import ActionButton from "../ui/ActionButton";
import Notice from "../ui/Notice";

export default function CourseModal({ open, course, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="relative z-10 w-full max-w-2xl rounded-[28px] border border-[#d8e0ef] bg-[#f9fbff] p-6 shadow-[0_24px_52px_rgba(31,42,68,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#495e8d]">
              Single Course View
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[#1f2a44]">Course Details</h3>
          </div>
          <ActionButton variant="ghost" onClick={onClose}>
            <span className="inline-flex items-center gap-2">
              <X size={16} /> Close
            </span>
          </ActionButton>
        </div>

        <div className="mt-4">
          <Notice message={message} />
        </div>

        {course && (
          <dl className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[#dbe3f2] bg-[#eef3fb] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#607293]">
                Title
              </dt>
              <dd className="mt-1 text-base font-semibold text-[#1f2a44]">{course.title || course.task}</dd>
            </div>
            <div className="rounded-2xl border border-[#dbe3f2] bg-[#eef3fb] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#607293]">
                Details
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[#425172]">{course.details || course.description}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#dbe3f2] bg-[#eef3fb] p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#607293]">
                  Semester
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#1f2a44]">{course.semester || course.dueDate || "-"}</dd>
              </div>
              <div className="rounded-2xl border border-[#dbe3f2] bg-[#eef3fb] p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#607293]">
                  Enroll Status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#1f2a44]">{course.enrollstatus || course.enrollStatus || course.status || "Enrolled"}</dd>
              </div>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
