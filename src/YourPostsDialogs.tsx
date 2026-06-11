import React from 'react';
import { Dialog } from './components/Dialog';
import CalendarExport from './components/CalendarExport';
import { AddressAutocomplete } from './components/AddressAutoComplete';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface PostData {
  id: number; title: string; description: string; location: string;
  start_datetime: string; end_datetime: string; max_participants: number;
  current_participants: number; user_name: string; visible: number;
  created_at: string; image_url?: string;
}

type ModalState = 'closed' | 'modal' | 'confirmation';

interface Props {
  createModalState: ModalState; setCreateModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  editModalState: ModalState; setEditModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  deleteModalState: ModalState; setDeleteModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  deletePostId: number | null; currentEditingPost: PostData | null;
  selectedEvent: PostData | null; setSelectedEvent: React.Dispatch<React.SetStateAction<PostData | null>>;
  showCalendarExport: boolean; setShowCalendarExport: React.Dispatch<React.SetStateAction<boolean>>;
  session: any; onPostCreated: () => void; onPostUpdated: () => void; onPostDeleted: () => void;
  isMobile: boolean;
}

interface EventFormData {
  title: string; desc: string; location: string; imageUrl: string;
  startDate: string; startTime: string; endDate: string; endTime: string;
  participants: number;
}

function useEventForm(initial?: Partial<EventFormData>) {
  const [form, setForm] = React.useState<EventFormData>({
    title: '', desc: '', location: '', imageUrl: '',
    startDate: '', startTime: '', endDate: '', endTime: '', participants: 1,
    ...initial,
  });
  const set = (key: keyof EventFormData) => (val: string | number) =>
    setForm(p => ({ ...p, [key]: val }));
  const reset = () => setForm({ title: '', desc: '', location: '', imageUrl: '', startDate: '', startTime: '', endDate: '', endTime: '', participants: 1 });
  return { form, set, reset, setForm };
}

function combineDT(date: string, time: string) {
  if (!date || !time) return '';
  return new Date(`${date}T${time}`).toISOString();
}

function EventFormFields({ form, set, isMobile }: { form: EventFormData; set: ReturnType<typeof useEventForm>['set']; isMobile: boolean }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Event Name *</label>
        <input className="input" required value={form.title} onChange={e => set('title')(e.target.value)} placeholder="ex: Swim Competition Volunteer" />
      </div>
      <div>
        <label className="label">Description *</label>
        <textarea className="input min-h-[80px] resize-y" required value={form.desc} onChange={e => set('desc')(e.target.value)} placeholder="Be descriptive about the event here." />
      </div>
      <div>
        <label className="label">Image URL</label>
        <input className="input" value={form.imageUrl} onChange={e => set('imageUrl')(e.target.value)} placeholder="Optional image URL for the event" />
      </div>
      <AddressAutocomplete value={form.location} onChange={val => set('location')(val)} required label="Location" />
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <label className="label">Start Date *</label>
          <input type="date" className="input" required value={form.startDate} onChange={e => set('startDate')(e.target.value)} />
        </div>
        <div>
          <label className="label">Start Time *</label>
          <input type="time" className="input" required value={form.startTime} onChange={e => set('startTime')(e.target.value)} />
        </div>
      </div>
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <label className="label">End Date *</label>
          <input type="date" className="input" required value={form.endDate} onChange={e => set('endDate')(e.target.value)} />
        </div>
        <div>
          <label className="label">End Time *</label>
          <input type="time" className="input" required value={form.endTime} onChange={e => set('endTime')(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Max Participants *</label>
        <input
          type="number" className="input" min={1} max={40} required
          value={form.participants} onChange={e => set('participants')(parseInt(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}

export default function YourPostsDialogs({
  createModalState, setCreateModalState, editModalState, setEditModalState,
  deleteModalState, setDeleteModalState, deletePostId, currentEditingPost,
  selectedEvent, setSelectedEvent, showCalendarExport, setShowCalendarExport,
  session, onPostCreated, onPostUpdated, onPostDeleted, isMobile,
}: Props) {
  const { form: createForm, set: setCreate, reset: resetCreate } = useEventForm();
  const { form: editForm, set: setEdit, setForm: setEditForm } = useEventForm();

  const userId = session?.user?.id;
  const userName = session?.user?.name || session?.user?.email;

  React.useEffect(() => {
    if (createModalState === 'modal') resetCreate();
  }, [createModalState]);

  React.useEffect(() => {
    if (editModalState === 'modal' && currentEditingPost) {
      const startDT = new Date(currentEditingPost.start_datetime);
      const endDT = new Date(currentEditingPost.end_datetime);
      const pad = (n: number) => String(n).padStart(2, '0');
      const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const toTimeStr = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setEditForm({
        title: currentEditingPost.title, desc: currentEditingPost.description,
        location: currentEditingPost.location, imageUrl: currentEditingPost.image_url || '',
        startDate: toDateStr(startDT), startTime: toTimeStr(startDT),
        endDate: toDateStr(endDT), endTime: toTimeStr(endDT),
        participants: currentEditingPost.max_participants,
      });
    }
  }, [editModalState, currentEditingPost]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = combineDT(createForm.startDate, createForm.startTime);
    const endDateTime = combineDT(createForm.endDate, createForm.endTime);
    if (!startDateTime || !endDateTime) { alert('Please select start and end date/time'); return; }
    try {
      const res = await fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ title: createForm.title, desc: createForm.desc, imageUrl: createForm.imageUrl, location: createForm.location, startDateTime, endDateTime, participants: String(createForm.participants), userId, userName }),
      });
      if (res.ok) { resetCreate(); setCreateModalState('confirmation'); onPostCreated(); }
      else { const err = await res.json(); alert('Error: ' + (err.error || JSON.stringify(err))); }
    } catch { alert('Failed to create post'); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingPost) return;
    const startDateTime = combineDT(editForm.startDate, editForm.startTime);
    const endDateTime = combineDT(editForm.endDate, editForm.endTime);
    if (!startDateTime || !endDateTime) { alert('Please select start and end date/time'); return; }
    try {
      const res = await fetch(`/api/posts/${currentEditingPost.id}/update`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ title: editForm.title, description: editForm.desc, imageUrl: editForm.imageUrl, location: editForm.location, startDateTime, endDateTime, maxParticipants: String(editForm.participants) }),
      });
      if (res.ok) { setEditModalState('confirmation'); onPostUpdated(); }
      else { const err = await res.json(); alert('Error: ' + (err.error || 'Failed to update post')); }
    } catch { alert('Failed to update post'); }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    try {
      const res = await fetch(`/api/posts/${deletePostId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { setDeleteModalState('confirmation'); onPostDeleted(); }
      else { const err = await res.json(); alert(err.error || 'Failed to delete post'); }
    } catch { alert('Failed to delete post'); }
  };

  return (
    <>
      {/* Create */}
      <Dialog
        open={createModalState === 'modal'}
        onClose={() => setCreateModalState('closed')}
        title="Create Community Service Event"
        footer={
          <>
            <button type="button" onClick={() => setCreateModalState('closed')} className="btn-secondary">Cancel</button>
            <button form="create-form" type="submit" className="btn-primary">Create</button>
          </>
        }
      >
        <form id="create-form" onSubmit={handleCreate}>
          <EventFormFields form={createForm} set={setCreate} isMobile={isMobile} />
        </form>
      </Dialog>

      <Dialog
        open={createModalState === 'confirmation'}
        onClose={() => setCreateModalState('closed')}
        title="Event Created!"
        footer={<button onClick={() => setCreateModalState('closed')} className="btn-primary">OK</button>}
      >
        <p className="text-gray-300 text-sm">
          Your event has been created! Click <EllipsisHorizontalIcon className="inline w-4 h-4" /> → "View Post" to see it.
        </p>
      </Dialog>

      {/* Edit */}
      <Dialog
        open={editModalState === 'modal'}
        onClose={() => setEditModalState('closed')}
        title="Edit Community Service Event"
        footer={
          <>
            <button type="button" onClick={() => setEditModalState('closed')} className="btn-secondary">Cancel</button>
            <button form="edit-form" type="submit" className="btn-primary">Update</button>
          </>
        }
      >
        <form id="edit-form" onSubmit={handleEdit}>
          <EventFormFields form={editForm} set={setEdit} isMobile={isMobile} />
        </form>
      </Dialog>

      <Dialog
        open={editModalState === 'confirmation'}
        onClose={() => setEditModalState('closed')}
        title="Event Updated!"
        footer={<button onClick={() => setEditModalState('closed')} className="btn-primary">OK</button>}
      >
        <p className="text-gray-300 text-sm">Your event has been updated successfully!</p>
      </Dialog>

      {/* Delete */}
      <Dialog
        open={deleteModalState === 'modal'}
        onClose={() => setDeleteModalState('closed')}
        title="Delete Event Post?"
        footer={
          <>
            <button onClick={() => setDeleteModalState('closed')} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </>
        }
      >
        <p className="text-gray-300 text-sm">Are you sure you want to delete this post? This action cannot be undone.</p>
      </Dialog>

      <Dialog
        open={deleteModalState === 'confirmation'}
        onClose={() => setDeleteModalState('closed')}
        title="Event Deleted"
        footer={<button onClick={() => setDeleteModalState('closed')} className="btn-primary">OK</button>}
      >
        <p className="text-gray-300 text-sm">Your event post has been deleted. If this was done by mistake you'll need to create a new event.</p>
      </Dialog>

      {selectedEvent && (
        <CalendarExport
          open={showCalendarExport}
          onClose={() => { setShowCalendarExport(false); setSelectedEvent(null); }}
          event={{ title: selectedEvent.title, description: selectedEvent.description, location: selectedEvent.location, startDateTime: selectedEvent.start_datetime, endDateTime: selectedEvent.end_datetime, organizerName: selectedEvent.user_name }}
        />
      )}
    </>
  );
}