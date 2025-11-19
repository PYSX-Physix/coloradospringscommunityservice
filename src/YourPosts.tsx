import React from "react";
import { Button, Input, Text, Field, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea,
  Table, TableHeader, TableRow, TableHeaderCell, TableCell, TableBody, Title1,
  TableCellLayout} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import { EditRegular, EyeRegular, AddCircle32Color } from "@fluentui/react-icons";

function YourPosts() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [participants, setParticipants] = React.useState("");

  const combineDateAndTime = (date: Date | null, time: Date | null): string => {
    if (!date || !time) return '';
    
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined.toISOString();
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);

    if (!startDateTime || !endDateTime) {
      alert('Please select both date and time for start and end');
      return;
    }
    
    // CRITICAL: Use startDateTime and endDateTime, NOT startDate/startTime those will cause error 500
    const newPost = { 
      title, 
      desc, 
      location, 
      startDateTime,
      endDateTime,
      participants
    };

    console.log('Sending:', newPost);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const responseText = await res.text();
      console.log('Response:', responseText);

      if (res.ok) {
        const data = JSON.parse(responseText);
        alert('Post created successfully with ID: ' + data.id);
        
        // Reset form
        setTitle("");
        setDesc("");
        setLocation("");
        setStartDate(null);
        setStartTime(null);
        setEndDate(null);
        setEndTime(null);
        setParticipants("");
      } else {
        const error = JSON.parse(responseText);
        alert('Error: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to create post');
    }
  };

  const TempItems = [
    {
      postTitle: {label: "Service Event 1"},
      desc: {label: "This is a test description of the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "November 12, 2025 at 2:30 PM"},
      eventEnd: {label: "November 12, 2025 at 3:30 PM"},
      visible: {label: "Visible"}
    }
  ];

  const columns = [
    {columnKey: "title", label: "Title"},
    {columnKey: "description", label: "Description"},
    {columnKey: "created", label: "Created On"},
    {columnKey: "start", label: "Starts"},
    {columnKey: "ends", label: "Ends"},
    {columnKey: "visible", label: "Visibility"}
  ];

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Title1 style={{marginBottom: '16px'}}>Saved Events</Title1>
      <Text>Saved posts will go here</Text>
      <Divider style={{marginTop: "16px", marginBottom: "16px"}}/>
      <div style={{display: "flex", flexDirection: "row"}}>
        <Title1>Manage Events</Title1>
        <Dialog modalType="non-modal">
          <DialogTrigger disableButtonEnhancement>
            <Button size="small" appearance="subtle" style={{alignSelf: "start", marginLeft: '16px'}}><AddCircle32Color/></Button>
          </DialogTrigger>
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
                      required 
                    />
                  </Field>
                  <Field label={"Location:"} required>
                    <Input 
                      placeholder="ex: 1234, Main Street Rd" 
                      value={location} 
                      onChange={(_, data) => setLocation(data.value)} 
                      required
                    />
                  </Field>
                  <div style={{display: "flex", flexDirection: 'row'}}>
                    <Field label={"Start Day"} required>
                      <DatePicker 
                        placeholder="Select a Date..." 
                        value={startDate} 
                        onSelectDate={(date) => setStartDate(date || null)} 
                        required
                      />
                    </Field>
                    <Field style={{marginLeft: '16px'}} label={"Start Time"} required>
                      <TimePicker 
                        placeholder="Select a Time..." 
                        selectedTime={startTime}
                        onTimeChange={(_, data) => setStartTime(data.selectedTime || null)}
                        required
                      />
                    </Field>
                  </div>
                  <div style={{display: "flex", flexDirection: 'row'}}>
                    <Field label={"End Day"} required>
                      <DatePicker 
                        placeholder="Select a Date..." 
                        value={endDate} 
                        onSelectDate={(date) => setEndDate(date || null)} 
                        required
                      />
                    </Field>
                    <Field style={{marginLeft: '16px'}} label={"End Time"} required>
                      <TimePicker 
                        placeholder="Select a Time..." 
                        selectedTime={endTime}
                        onTimeChange={(_, data) => setEndTime(data.selectedTime || null)}
                        required
                      />
                    </Field>
                  </div>
                  <Field label={"Number of Participants"} required>
                    <Input 
                      type="number" 
                      value={participants}
                      onChange={(_, data) => setParticipants(data.value)}
                      required
                    />
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
      <Table style={{marginTop: '16px'}} aria-label="Your Posts Table" id="yourpoststable" sortable>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.columnKey}>
                {column.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {TempItems.map((item) => (
            <TableRow key={item.postTitle.label}>
              <TableCell>{item.postTitle.label}</TableCell>
              <TableCell>{item.desc.label}</TableCell>
              <TableCell>{item.created.label}</TableCell>
              <TableCell>{item.eventStart.label}</TableCell>
              <TableCell>{item.eventEnd.label}</TableCell>
              <TableCell>{item.visible.label}</TableCell>
              <TableCell role="gridcell">
                <TableCellLayout>
                  <Button icon={<EditRegular/>}>Edit</Button>
                  <Button as="a" href="/post" icon={<EyeRegular/>}>View</Button>
                </TableCellLayout>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default YourPosts;
/*

4. **Save the file**
5. **Restart both terminals:**
   - Terminal 1: `npm run dev:react`
   - Terminal 2: `npm run dev:wrangler`
6. **Hard refresh the browser** (Ctrl+Shift+R)

Then try submitting the form again. In the Wrangler terminal, you should now see:
```
Received POST request: {
  title: '...',
  desc: '...',
  location: '...',
  startDateTime: '2025-11-20T14:00:00.000Z',  // ← Should be ISO string
  endDateTime: '2025-11-20T16:30:00.000Z',    // ← Should be ISO string
  participants: '15'
}*/