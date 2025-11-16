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
  const [date, setDate] = React.useState<string>("");

  const handlePostSubmit = async () => {
    const newPost = { title, desc, location, date: date?.toString() };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });

    if (res.ok) {
      console.log("Post submitted!");
    }
  };

  const TempItems = [
    {
      postTitle: {label: "Service Event 1"},
      desc: {label: "This is a test description of a the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "2:30pm"},
      eventEnd: {label: "3:30pm"},
      visable: {label: "Visable"}
    },
    {
      postTitle: {label: "Service Event 2"},
      desc: {label: "This is a test description of a the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "2:30pm"},
      eventEnd: {label: "3:30pm"},
      visable: {label: "Visable"}
    },
    {
      postTitle: {label: "Service Event 3"},
      desc: {label: "This is a test description of a the test event"},
      created: {label: "11/12/2025", timeStamp: 1},
      eventStart: {label: "2:30pm"},
      eventEnd: {label: "3:30pm"},
      visable: {label: "Visable"}
    }    
  ]

  const columns = [
    {columnKey: "title", label: "Title"},
    {columnKey: "description", label: "Description"},
    {columnKey: "created", label: "Created On"},
    {columnKey: "start", label: "Starts"},
    {columnKey: "ends", label: "Ends"},
    {columnKey: "visable", label: "Visability"}
  ]

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Title1>Saved Events</Title1>
      <Text>Saved posts will go here</Text>
      <Divider style={{marginTop: "16px", marginBottom: "16px"}}/>
      <div style={{display: "flex", flexDirection: "row"}}>
        <Title1>Manage Events</Title1>
        <Dialog modalType="non-modal">
          <DialogTrigger disableButtonEnhancement>
            <Button size="small" appearance="subtle" style={{alignSelf: "start", marginLeft: '16px'}}><AddCircle32Color/></Button>
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
                  <Field label={"Start Day"} required>
                    <DatePicker placeholder="Select a Date..." value={date ? new Date(date) : null} onSelectDate={(startDate) => setDate(startDate ? startDate.toDateString() : "")} required></DatePicker>
                  </Field>
                  <Field label={"Start Time"} required>
                    <TimePicker placeholder="Select a Time..." required/>
                  </Field>
                  <Field label={"End Day"} required>
                    <DatePicker placeholder="Select a Date..." value={date ? new Date(date) : null} onSelectDate={(endDate) => setDate(endDate ? endDate.toDateString() : "")} required></DatePicker>
                  </Field>
                  <Field label={"End Time"} required>
                    <TimePicker placeholder="Select a Time..." required/>
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
      <Table aria-label="Your Posts Table" id="yourpoststable" sortable>
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
          {TempItems.map ((item) => (
            <TableRow key={item.postTitle.label}>
              <TableCell>
                {item.postTitle.label}
              </TableCell>
              <TableCell>
                {item.desc.label}
              </TableCell>
              <TableCell>
                {item.created.label}
              </TableCell>
              <TableCell>
                {item.eventStart.label}
              </TableCell>
              <TableCell>
                {item.eventEnd.label}
              </TableCell>
              <TableCell>
                {item.visable.label}
              </TableCell>
              <TableCell role="gridcell">
                <TableCellLayout>
                  <Button icon={<EditRegular/>}>Edit</Button>
                  <Button icon={<EyeRegular/>}>View</Button>
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