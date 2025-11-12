import React from "react";
import { Button, Input, Text, Field, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";

function YourPosts() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState<string>("");

  const API_URL = "https://cospringscs-api-preview.varomicgames.workers.dev/api/posts";

  const handlePostSubmit = async () => {
    const newPost = {
      title,
      desc,
      location,
      date: date?.toString(),
      createdBy: "currentUser"
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    });

    if (res.ok) {
      console.log("Post submitted!");
    }
  };

  return (
    <div>
      <Dialog modalType="non-modal">
        <DialogTrigger disableButtonEnhancement>
          <Button>Create Post</Button>
        </DialogTrigger>
        <DialogSurface>
          <form onSubmit={handlePostSubmit} method="post">
            <DialogBody>
              <DialogTitle>Create Community Service Event</DialogTitle>
              <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <Text></Text>
                <Divider style={{marginBottom: '15px', marginTop: '15px'}}/>
                <Field label={"Event Name:"} required>
                  <Input id="titlebox" placeholder="ex: Swim Competition Volunteer" value={title} onChange={ (_, data) => setTitle(data.value) } required/>
                </Field>
                <Field label={"Description:"} required>
                  <Textarea placeholder="Be descriptive about the event here." value={desc} onChange={ (_, data) => setDesc(data.value)} required />
                </Field>
                <Field label={"Location:"} required>
                  <Input placeholder="ex: 1234, Main Street Rd" value={location} onChange={(_, data) => setLocation(data.value)} required/>
                </Field>
                <Field label={"Date of Event"} required>
                  <DatePicker placeholder="Select a Date..." value={date ? new Date(date) : null} onSelectDate={(newDate) => setDate(newDate ? newDate.toDateString() : "")} required></DatePicker>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" type="submit">Create</Button>
                <DialogTrigger>
                  <Button appearance="secondary">Cancel</Button>
                </DialogTrigger>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default YourPosts;