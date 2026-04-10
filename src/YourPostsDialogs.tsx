import React from "react";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import CalendarExport from "./components/CalendarExport";
import { AddressAutocomplete } from "./components/AddressAutoComplete";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

interface PostData {
  id: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  current_participants: number;
  user_name: string;
  visible: number;
  created_at: string;
  image_url?: string;
}

interface YourPostsDialogsProps {
  createModalState: "closed" | "modal" | "confirmation";
  setCreateModalState: React.Dispatch<React.SetStateAction<"closed" | "modal" | "confirmation">>;
  editModalState: "closed" | "modal" | "confirmation";
  setEditModalState: React.Dispatch<React.SetStateAction<"closed" | "modal" | "confirmation">>;
  deleteModalState: "closed" | "modal" | "confirmation";
  setDeleteModalState: React.Dispatch<React.SetStateAction<"closed" | "modal" | "confirmation">>;
  deletePostId: number | null;
  currentEditingPost: PostData | null;
  selectedEvent: PostData | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<PostData | null>>;
  showCalendarExport: boolean;
  setShowCalendarExport: React.Dispatch<React.SetStateAction<boolean>>;
  session: any;
  onPostCreated: () => void;
  onPostUpdated: () => void;
  onPostDeleted: () => void;
  isMobile: boolean;
}

// Shared modal backdrop + shell
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#2d2d2d] border border-gray-700 rounded-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4 flex-1">
          {children}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-end">
          {footer}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors w-full";

const labelClass = "text-sm font-medium text-gray-300";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function EventForm({
  title, setTitle,
  desc, setDesc,
  imageUrl, setImageUrl,
  location, setLocation,
  startDate, setStartDate,
  startTime, setStartTime,
  endDate, setEndDate,
  endTime, setEndTime,
  participants, setParticipants,
  isMobile,
  onSubmit,
}: {
  title: string; setTitle: (v: string) => void;
  desc: string; setDesc: (v: string) => void;
  imageUrl: string; setImageUrl: (v: string) => void;
  location: string; setLocation: (v: string) => void;
  startDate: Date | null; setStartDate: (v: Date | null) => void;
  startTime: Date | null; setStartTime: (v: Date | null) => void;
  endDate: Date | null; setEndDate: (v: Date | null) => void;
  endTime: Date | null; setEndTime: (v: Date | null) => void;
  participants: number; setParticipants: (v: number) => void;
  isMobile: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form id="event-form" onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Event Name" required>
        <input
          className={inputClass}
          placeholder="ex: Swim Competition Volunteer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>

      <Field label="Description" required>
        <textarea
          className={inputClass + " resize-y min-h-20"}
          placeholder="Be descriptive about the event here."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
      </Field>

      <Field label="Image URL">
        <input
          className={inputClass}
          placeholder="Optional image URL for the event"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </Field>

      {/* AddressAutocomplete still uses Fluent UI internally — will be replaced later */}
      <AddressAutocomplete
        value={location}
        onChange={setLocation}
        required
        label="Location"
      />

      <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
        <Field label="Start Day" required>
          <DatePicker
            placeholder="Select a Date..."
            value={startDate}
            onSelectDate={(date) => setStartDate(date || null)}
          />
        </Field>
        <Field label="Start Time" required>
          <TimePicker
            placeholder="Select a Time..."
            selectedTime={startTime}
            onTimeChange={(_, data) => setStartTime(data.selectedTime || null)}
          />
        </Field>
      </div>

      <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
        <Field label="End Day" required>
          <DatePicker
            placeholder="Select a Date..."
            value={endDate}
            onSelectDate={(date) => setEndDate(date || null)}
          />
        </Field>
        <Field label="End Time" required>
          <TimePicker
            placeholder="Select a Time..."
            selectedTime={endTime}
            onTimeChange={(_, data) => setEndTime(data.selectedTime || null)}
          />
        </Field>
      </div>

      <Field label="Number of Participants" required>
        <input
          type="number"
          className={inputClass}
          value={participants}
          onChange={(e) => setParticipants(Math.max(1, Math.min(40, Number(e.target.value))))}
          min={1}
          max={40}
          required
        />
      </Field>
    </form>
  );
}

function YourPostsDialogs({
  createModalState, setCreateModalState,
  editModalState, setEditModalState,
  deleteModalState, setDeleteModalState,
  deletePostId,
  currentEditingPost,
  selectedEvent, setSelectedEvent,
  showCalendarExport, setShowCalendarExport,
  session,
  onPostCreated, onPostUpdated, onPostDeleted,
  isMobile,
}: YourPostsDialogsProps) {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [participants, setParticipants] = React.useState(1);
  const [imageUrl, setImageUrl] = React.useState("");

  const userId = session.user.id;
  const userName = session.user.name || session.user.email;

  const combineDateAndTime = (date: Date | null, time: Date | null): string => {
    if (!date || !time) return "";
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined.toISOString();
  };

  const resetForm = () => {
    setTitle(""); setDesc(""); setImageUrl(""); setLocation("");
    setStartDate(null); setStartTime(null);
    setEndDate(null); setEndTime(null);
    setParticipants(1);
  };

  React.useEffect(() => {
    if (editModalState === "modal" && currentEditingPost) {
      setTitle(currentEditingPost.title);
      setDesc(currentEditingPost.description);
      setLocation(currentEditingPost.location);
      setImageUrl(currentEditingPost.image_url || "");
      const startDT = new Date(currentEditingPost.start_datetime);
      const endDT = new Date(currentEditingPost.end_datetime);
      setStartDate(new Date(startDT.getFullYear(), startDT.getMonth(), startDT.getDate()));
      setEndDate(new Date(endDT.getFullYear(), endDT.getMonth(), endDT.getDate()));
      setStartTime(new Date(0, 0, 0, startDT.getHours(), startDT.getMinutes()));
      setEndTime(new Date(0, 0, 0, endDT.getHours(), endDT.getMinutes()));
      setParticipants(currentEditingPost.max_participants);
    }
  }, [editModalState, currentEditingPost]);

  React.useEffect(() => {
    if (createModalState === "modal") resetForm();
  }, [createModalState]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);
    if (!startDateTime || !endDateTime) {
      alert("Please select both date and time for start and end");
      return;
    }
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, desc, imageUrl, location, startDateTime, endDateTime, participants: participants.toString(), userId, userName }),
      });
      if (res.ok) {
        resetForm();
        setCreateModalState("confirmation");
        onPostCreated();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || JSON.stringify(error)));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to create post");
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    try {
      const res = await fetch(`/api/posts/${deletePostId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDeleteModalState("confirmation");
        onPostDeleted();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingPost) return;
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);
    if (!startDateTime || !endDateTime) {
      alert("Please select both date and time for start and end");
      return;
    }
    try {
      const res = await fetch(`/api/posts/${currentEditingPost.id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description: desc, imageUrl, location, startDateTime, endDateTime, maxParticipants: participants.toString() }),
      });
      if (res.ok) {
        resetForm();
        setEditModalState("confirmation");
        onPostUpdated();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || "Failed to update post"));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update post");
    }
  };

  const formProps = {
    title, setTitle, desc, setDesc, imageUrl, setImageUrl,
    location, setLocation, startDate, setStartDate, startTime, setStartTime,
    endDate, setEndDate, endTime, setEndTime, participants, setParticipants,
    isMobile,
  };

  const btnPrimary = "bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors";
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded transition-colors";
  const btnDanger = "bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors";

  return (
    <>
      {/* Create Modal */}
      <Modal
        open={createModalState === "modal"}
        onClose={() => setCreateModalState("closed")}
        title="Create Community Service Event"
        footer={
          <>
            <button type="submit" form="event-form" className={btnPrimary}>Create</button>
            <button onClick={() => setCreateModalState("closed")} className={btnSecondary}>Cancel</button>
          </>
        }
      >
        <EventForm {...formProps} onSubmit={handlePostSubmit} />
      </Modal>

      {/* Create Confirmation */}
      <Modal
        open={createModalState === "confirmation"}
        onClose={() => setCreateModalState("closed")}
        title="Event Created!"
        footer={
          <button onClick={() => setCreateModalState("closed")} className={btnPrimary}>Ok</button>
        }
      >
        <p className="text-gray-300 text-sm">
          Your event has been created! Click the <EllipsisHorizontalIcon className="inline"/> menu next to it to view the post.
        </p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalState === "modal"}
        onClose={() => { setEditModalState("closed"); resetForm(); }}
        title="Edit Community Service Event"
        footer={
          <>
            <button type="submit" form="event-form" className={btnPrimary}>Update</button>
            <button onClick={() => { setEditModalState("closed"); resetForm(); }} className={btnSecondary}>Cancel</button>
          </>
        }
      >
        <EventForm {...formProps} onSubmit={handleEditSubmit} />
      </Modal>

      {/* Edit Confirmation */}
      <Modal
        open={editModalState === "confirmation"}
        onClose={() => setEditModalState("closed")}
        title="Event Updated!"
        footer={
          <button onClick={() => setEditModalState("closed")} className={btnPrimary}>Ok</button>
        }
      >
        <p className="text-gray-300 text-sm">Your event has been updated successfully!</p>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={deleteModalState === "modal"}
        onClose={() => setDeleteModalState("closed")}
        title="Delete Event Post?"
        footer={
          <>
            <button onClick={handleDelete} className={btnDanger}>Delete</button>
            <button onClick={() => setDeleteModalState("closed")} className={btnSecondary}>Cancel</button>
          </>
        }
      >
        <p className="text-gray-300 text-sm">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
      </Modal>

      {/* Delete Success */}
      <Modal
        open={deleteModalState === "confirmation"}
        onClose={() => setDeleteModalState("closed")}
        title="Event Deleted"
        footer={
          <button onClick={() => setDeleteModalState("closed")} className={btnPrimary}>Ok</button>
        }
      >
        <p className="text-gray-300 text-sm">
          Your event post has been deleted. If this was done by mistake you'll need to create a new event.
        </p>
      </Modal>

      {/* Calendar Export */}
      {selectedEvent && (
        <CalendarExport
          open={showCalendarExport}
          onClose={() => { setShowCalendarExport(false); setSelectedEvent(null); }}
          event={{
            title: selectedEvent.title,
            description: selectedEvent.description,
            location: selectedEvent.location,
            startDateTime: selectedEvent.start_datetime,
            endDateTime: selectedEvent.end_datetime,
            organizerName: selectedEvent.user_name,
          }}
        />
      )}
    </>
  );
}

export default YourPostsDialogs;