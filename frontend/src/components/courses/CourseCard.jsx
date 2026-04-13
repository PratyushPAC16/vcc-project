import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionButton from "../ui/ActionButton";
import StatusPill from "../ui/StatusPill";

export default function CourseCard({ course, onView, onEdit, onDelete }) {
  const statusTone = course.enrollstatus === "Enrolled" ? "success" : "neutral";

  return (
    <article className="animate-rise rounded-3xl border border-[#d8e1f1] bg-[#f9fbff] p-5 shadow-[0_12px_26px_rgba(31,42,68,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(31,42,68,0.16)]">
      <h3 className="text-lg font-extrabold tracking-tight text-[#1f2a44]">{course.title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-[#5e6d8d]">{course.details}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill tone="warm">{course.semester}</StatusPill>
        <StatusPill tone={statusTone}>{course.enrollstatus}</StatusPill>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionButton variant="subtle" onClick={() => onView(course.id)}>
          <span className="inline-flex items-center gap-2">
            <Eye size={15} /> View
          </span>
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => onEdit(course)}>
          <span className="inline-flex items-center gap-2">
            <Pencil size={15} /> Edit
          </span>
        </ActionButton>
        <ActionButton variant="danger" onClick={() => onDelete(course.id)}>
          <span className="inline-flex items-center gap-2">
            <Trash2 size={15} /> Delete
          </span>
        </ActionButton>
      </div>
    </article>
  );
}
