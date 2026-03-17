import React from "react";
import { Button, Input, Text, Field, Dialog, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea,
  SpinButton } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";

import CalendarExport from "./components/CalendarExport";
import { AddressAutocomplete } from "./components/AddressAutoComplete";

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

type DeleteModalState = 'closed' | 'modal' | 'confirmation'
type CreateModalState = 'closed' | 'modal' | 'confirmation'
type EditModalState = 'closed' | 'modal' | 'confirmation'

interface YourPostsDialogsProps {
  createModalState: CreateModalState;
  setCreateModalState: React.Dispatch<React.SetStateAction<CreateModalState>>;
  editModalState: EditModalState;
  setEditModalState: React.Dispatch<React.SetStateAction<EditModalState>>;
  deleteModalState: DeleteModalState;
  setDeleteModalState: React.Dispatch<React.SetStateAction<DeleteModalState>>;
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

function YourPostsDialogs({
  createModalState,
  setCreateModalState,
  editModalState,
  setEditModalState,
  deleteModalState,
  setDeleteModalState,
  deletePostId,
  currentEditingPost,
  selectedEvent,
  setSelectedEvent,
  showCalendarExport,
  setShowCalendarExport,
  session,
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
  isMobile,
}: YourPostsDialogsProps) {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [participants, setParticipants] = React.useState<number>(1);
  const [imageUrl, setImageUrl] = React.useState<string>("");

  const userId = session.user.id;
  const userName = session.user.name || session.user.email;

  const combineDateAndTime = (date: Date | null, time: Date | null): string => {
    if (!date || !time) return '';
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined.toISOString();
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setImageUrl("");
    setLocation("");
    setStartDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setParticipants(1);
  };

  React.useEffect(() => {
    if (editModalState === 'modal' && currentEditingPost) {
      setTitle(currentEditingPost.title);
      setDesc(currentEditingPost.description);
      setLocation(currentEditingPost.location);
      setImageUrl(currentEditingPost.image_url || "");

      const startDT = new Date(currentEditingPost.start_datetime);
      const endDT = new Date(currentEditingPost.end_datetime);

      setStartDate(new Date(startDT.getFullYear(), startDT.getMonth(), startDT.getDate()));
      setEndDate(new Date(endDT.getFullYear(), endDT.getMonth(), endDT.getDate()));
      setStartTime(new Date(startDT.getHours(), startDT.getMinutes()));
      setEndTime(new Date(endDT.getHours(), endDT.getMinutes()));
      setParticipants(currentEditingPost.max_participants);
    }
  }, [editModalState, currentEditingPost]);

  React.useEffect(() => {
    if (createModalState === 'modal') {
      resetForm();
    }
  }, [createModalState]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);

    if (!startDateTime || !endDateTime) {
      alert('Please select both date and time for start and end');
      return;
    }

    const newPost = {
      title,
      desc,
      imageUrl,
      location,
      startDateTime,
      endDateTime,
      participants: participants.toString(),
      userId,
      userName
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        resetForm();
        setCreateModalState("confirmation");
        onPostCreated();
      } else {
        const error = await res.json();
        alert('Error: ' + (error.error || JSON.stringify(error)));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to create post');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      // credentials: 'include' is required — without it the session cookie
      // is not sent and the server returns 401 Unauthorized.
      const res = await fetch(`/api/posts/${deletePostId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setDeleteModalState('confirmation');
        onPostDeleted();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentEditingPost) return;

    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);

    if (!startDateTime || !endDateTime) {
      alert('Please select both date and time for start and end');
      return;
    }

    const updateData = {
      title,
      description: desc,
      imageUrl,
      location,
      startDateTime,
      endDateTime,
      maxParticipants: participants.toString(),
    };

    try {
      const res = await fetch(`/api/posts/${currentEditingPost.id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        resetForm();
        setEditModalState("confirmation");
        onPostUpdated();
      } else {
        const error = await res.json();
        alert('Error: ' + (error.error || 'Failed to update post'));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update post');
    }
  };

  return (
    <>
      {/* Create Event Dialog */}
      <Dialog open={createModalState === 'modal'} onOpenChange={() => setCreateModalState("closed")}>
        <DialogSurface>
          <form onSubmit={handlePostSubmit}>
            <DialogBody>
              <DialogTitle>Create Community Service Event</DialogTitle>
              <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <Divider style={{marginBottom: '15px', marginTop: '15px'}}/>
                <Field label={"Event Name:"} required>
                  <Input
                    placeholder="ex: Swim Competition Volunteer"
                    value={title}
                    onChange={(_, data) => setTitle(data.value)}
                    required
                  />
                </Field>
                <Field label={"Description:"} required>
                  <Textarea
                    placeholder="Be descriptive about the event here."
                    value={desc}
                    onChange={(_, data) => setDesc(data.value)}
                    resize="vertical"
                    required
                  />
                </Field>
                <Field label={"Image URL"}>
                  <Input
                    placeholder="Optional image URL for the event"
                    value={imageUrl}
                    onChange={(_, data) => setImageUrl(data.value)}
                  />
                </Field>
                <AddressAutocomplete value={location} onChange={setLocation} required label="Location"/>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '8px'
                }}>
                  <Field label={"Start Day"} required>
                    <DatePicker
                      placeholder="Select a Date..."
                      value={startDate}
                      onSelectDate={(date) => setStartDate(date || null)}
                      required
                    />
                  </Field>
                  <Field label={"Start Time"} required>
                    <TimePicker
                      placeholder="Select a Time..."
                      selectedTime={startTime}
                      onTimeChange={(_, data) => setStartTime(data.selectedTime || null)}
                      required
                    />
                  </Field>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '8px'
                }}>
                  <Field label={"End Day"} required>
                    <DatePicker
                      placeholder="Select a Date..."
                      value={endDate}
                      onSelectDate={(date) => setEndDate(date || null)}
                      required
                    />
                  </Field>
                  <Field label={"End Time"} required>
                    <TimePicker
                      placeholder="Select a Time..."
                      selectedTime={endTime}
                      onTimeChange={(_, data) => setEndTime(data.selectedTime || null)}
                      required
                    />
                  </Field>
                </div>
                <Field label={"Number of Participants"} required>
                  <SpinButton
                    value={participants}
                    onChange={(_, data) => setParticipants(data.value || 1)}
                    min={1}
                    max={40}
                    required
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" type="submit">Create</Button>
                <Button appearance="secondary" onClick={() => setCreateModalState("closed")}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      {/* Event Created Confirmation */}
      <Dialog open={createModalState === 'confirmation'} onOpenChange={() => setCreateModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Event Created!</DialogTitle>
            <DialogContent>Your event has been created! If you want to view it, just click "View Post" under <MoreHorizontal20Regular/> menu to see it.</DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setCreateModalState('closed')}>Ok</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editModalState === 'modal'} onOpenChange={() => {
        setEditModalState("closed");
        resetForm();
      }}>
        <DialogSurface>
          <form onSubmit={handleEditSubmit}>
            <DialogBody>
              <DialogTitle>Edit Community Service Event</DialogTitle>
              <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <Divider style={{marginBottom: '15px', marginTop: '15px'}}/>
                <Field label={"Event Name:"} required>
                  <Input
                    placeholder="ex: Swim Competition Volunteer"
                    value={title}
                    onChange={(_, data) => setTitle(data.value)}
                    required
                  />
                </Field>
                <Field label={"Description:"} required>
                  <Textarea
                    placeholder="Be descriptive about the event here."
                    value={desc}
                    onChange={(_, data) => setDesc(data.value)}
                    required
                    resize="vertical"
                  />
                </Field>
                <Field label={"Image URL"}>
                  <Input
                    placeholder="Optional image URL for the event"
                    value={imageUrl}
                    onChange={(_, data) => setImageUrl(data.value)}
                  />
                </Field>
                <AddressAutocomplete value={location} onChange={setLocation} required label="Location"/>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '8px'
                }}>
                  <Field label={"Start Day"} required>
                    <DatePicker
                      placeholder="Select a Date..."
                      value={startDate}
                      onSelectDate={(date) => setStartDate(date || null)}
                      required
                    />
                  </Field>
                  <Field label={"Start Time"} required>
                    <TimePicker
                      placeholder="Select a Time..."
                      selectedTime={startTime}
                      onTimeChange={(_, data) => setStartTime(data.selectedTime || null)}
                      required
                    />
                  </Field>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '8px'
                }}>
                  <Field label={"End Day"} required>
                    <DatePicker
                      placeholder="Select a Date..."
                      value={endDate}
                      onSelectDate={(date) => setEndDate(date || null)}
                      required
                    />
                  </Field>
                  <Field label={"End Time"} required>
                    <TimePicker
                      placeholder="Select a Time..."
                      selectedTime={endTime}
                      onTimeChange={(_, data) => setEndTime(data.selectedTime || null)}
                      required
                    />
                  </Field>
                </div>
                <Field label={"Number of Participants"} required>
                  <SpinButton
                    value={participants}
                    onChange={(_, data) => setParticipants(data.value || 1)}
                    min={1}
                    max={40}
                    required
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" type="submit">Update</Button>
                <Button appearance="secondary" onClick={() => {
                  setEditModalState("closed");
                  resetForm();
                }}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      {/* Event Updated Confirmation */}
      <Dialog open={editModalState === 'confirmation'} onOpenChange={() => setEditModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Event Updated!</DialogTitle>
            <DialogContent>Your event has been updated successfully!</DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setEditModalState('closed')}>Ok</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteModalState === "modal"} onOpenChange={(_, data) => !data.open && setDeleteModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Event Post?</DialogTitle>
            <DialogContent>
              <Divider style={{ marginBottom: '15px', marginTop: '15px' }} />
              <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
            </DialogContent>
            <DialogActions style={{ marginTop: '15px'}}>
              <Button appearance='primary' onClick={handleDelete}>Delete</Button>
              <Button appearance='secondary' onClick={() => setDeleteModalState("closed")}>Cancel</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Success */}
      <Dialog open={deleteModalState === 'confirmation'} onOpenChange={(_, data) => !data.open && setDeleteModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Event Deleted</DialogTitle>
            <DialogContent>Your event post has been deleted. If this was done by mistake you have to make a new event.</DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setDeleteModalState('closed')}>Ok</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {selectedEvent && (
        <CalendarExport
          open={showCalendarExport}
          onClose={() => {
            setShowCalendarExport(false);
            setSelectedEvent(null);
          }}
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