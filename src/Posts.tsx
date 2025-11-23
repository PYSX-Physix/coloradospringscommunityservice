import React from 'react';
import {
  Title1, Title3, Text, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  RadioGroup,
  Radio,
  Divider,
  Textarea,
  Card,
  CardPreview,
  makeStyles,
  CardHeader,
  CardFooter
} from "@fluentui/react-components";
import { BookmarkAdd20Regular, Warning20Regular, CheckmarkCircle48Color, MoreHorizontal20Regular } from "@fluentui/react-icons";
import './App.css';


const cardStyles = makeStyles({
  card: {
    width: '400px',
    maxWidth: '100%',
    height: 'fit-content'
  }
});


function Posts() {
  return (
    <div>
      <Title1>Posts</Title1>
      <Divider style={{ marginTop: '16px', marginBottom: '32px' }}/>
      <div>
        <PostCard title='Test Cards System Test' desc="This is a test to prove that this system works. The user ID's will be different hopefully and nothing goes wrong when posting this because coding can be dumb sometimes." img='https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2F8_Pikes%2520Peak-Garden%2520of%2520the%2520Gods.jpg&w=2048&q=75' />
      </div>
    </div>
  );
}

function PostCard({ title, desc, img }: { title: string; desc: string; img?: string; }) {
  type ReportState = "closed" | "form" | "confirmation";
  const [reportState, setReportState] = React.useState<ReportState>("closed");

  const styles = cardStyles();

  const handleReportSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setReportState("confirmation");
  };

  // This is much better!
  return (
    <div>
      <Card className={styles.card}>
        <CardPreview>
          <img src={img} alt="Post preview" />
        </CardPreview>
        <CardHeader
          header={<Title3>{title}</Title3>}
          description={<Text>{desc}</Text>}
        />
        <CardFooter>
          <Button appearance="primary" as='a' href='/post?id=8'>Learn More</Button>
          <Menu>
            <MenuTrigger>
              <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<BookmarkAdd20Regular />}>Save Post</MenuItem>
                <MenuItem icon={<Warning20Regular />} onClick={() => setReportState("form")}>
                  Report Post
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </CardFooter>
      </Card>
      <Dialog open={reportState === "form"} modalType='non-modal'>
        <DialogSurface>
          <form onSubmit={handleReportSubmit}>
            <DialogBody>
              <DialogTitle>Report Post</DialogTitle>
              <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Text>Reporting this post will require us to review this report. Any reports that aren't legit will cause your account to be flagged and blocked from sending reports.</Text>
                <Divider style={{ marginBottom: '15px', marginTop: '15px' }} />
                <Field label={"Select a category"} required>
                  <RadioGroup required>
                    <Radio value={"spam"} label={"Spam"} />
                    <Radio value={"offensive"} label={"Offensive or Harmful Content"} />
                    <Radio value={"misinformation"} label={"Misinformation"} />
                    <Radio value={"safety concerns"} label={"Safety Concerns"} />
                    <Radio value={"duplicate"} label={"Duplicate Post"} />
                    <Radio value={"other"} label={"Other"} />
                  </RadioGroup>
                </Field>
                <Field label={"Additional Details (Optional)"}>
                  <Textarea placeholder='Details...'>
                  </Textarea>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance='primary' type='submit'>Report</Button>
                <Button appearance='secondary' onClick={() => setReportState("closed")}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
      <Dialog open={reportState === "confirmation"}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Report Sent</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
              <CheckmarkCircle48Color />
              <Text style={{ marginTop: '15px' }}>Your report has been succesfully sent and will be under review shortly.</Text>
            </DialogContent>
            <DialogActions>
              <Button appearance='primary' onClick={() => { setReportState('closed') }}>Close</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default Posts;