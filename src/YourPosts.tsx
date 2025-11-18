import React from "react";
import { Button, Input, Text, Field, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea,
  Table, TableHeader, TableRow, TableHeaderCell, TableCell, TableBody, Title1,
  TableCellLayout, Menu, MenuItem, MenuTrigger, MenuList, MenuPopover} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import { EditRegular, EyeRegular, AddCircle32Color, MoreHorizontal20Regular, Delete20Regular } from "@fluentui/react-icons";

function YourPosts() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [participants, setParticipants] = React.useState("");

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPost = { 
      title, 
      desc, 
      location, 
      startDate: startDate?.toString(),
      startTime: startTime?.toString(),
      endDate: endDate?.toString(),
      endTime: endTime?.toString(),
      participants
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });

    if (res.ok) {
      console.log("Post submitted!");
      // Reset form
      setTitle("");
      setDesc("");
      setLocation("");
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setParticipants("");
    }
  };

  const TempItems = [
    {
      postTitle: {label: "Service Event 1"},
      desc: {label: "This is a test description of the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "2:30pm"},
      eventEnd: {label: "3:30pm"},
      participants: {label: "3/5"},
      visible: {label: "Visible"}
    },
    {
      postTitle: {label: "Service Event 2"},
      desc: {label: "This is a test description of the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "2:30pm"},
      eventEnd: {label: "3:30pm"},
      participants: {label: "3/5"},
      visible: {label: "Visible"}
    },
    {
      postTitle: {label: "Service Event 3"},
      desc: {label: "This is a test description of the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "2:30pm"},
      eventEnd: {label: "3:30pm"},
      participants: {label: "3/5"},
      visible: {label: "Visible"}
    }    
  ];

  const columns = [
    {columnKey: "title", label: "Title"},
    {columnKey: "description", label: "Description"},
    {columnKey: "created", label: "Created On"},
    {columnKey: "start", label: "Starts"},
    {columnKey: "ends", label: "Ends"},
    {columnKey: "participants", label: "Participants"},
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
            <Button size="large" appearance="secondary" style={{alignSelf: "start", marginLeft: '16px'}} icon={<AddCircle32Color/>}/>
          </DialogTrigger>
          <DialogSurface>
            <form onSubmit={handlePostSubmit} method="post">
              <DialogBody>
                <DialogTitle>Create Community Service Event</DialogTitle>
                <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                  <Divider style={{marginBottom: '15px', marginTop: '15px'}}/>
                  <Field label={"Event Name:"} required>
                    <Input id="titlebox" placeholder="ex: Swim Competition Volunteer" value={title} onChange={(_, data) => setTitle(data.value)} required/>
                  </Field>
                  <Field label={"Description:"} required>
                    <Textarea id="descriptionbox" placeholder="Be descriptive about the event here." value={desc} onChange={(_, data) => setDesc(data.value)} required />
                  </Field>
                  <Field label={"Location:"} required>
                    <Input placeholder="ex: 1234, Main Street Rd" value={location} onChange={(_, data) => setLocation(data.value)} required/>
                  </Field>
                  <div style={{display: "flex", flexDirection: 'row', width: '100vh'}}>
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
              <TableCell>{item.participants.label}</TableCell>
              <TableCell>{item.visible.label}</TableCell>
              <TableCell role="gridcell">
                <TableCellLayout>
                  <Menu>
                    <MenuTrigger>
                      <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem icon={<EditRegular />}>Edit</MenuItem>
                        <MenuItem icon={<EyeRegular />}>View</MenuItem>
                        <MenuItem icon={<Delete20Regular/>}>Delete</MenuItem>
                        <MenuItem icon={<EyeRegular/>}>Hide/Show</MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
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