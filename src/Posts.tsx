import React from 'react';
import { Title1, Title3, Text, Button, Image, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
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
  Textarea
 } from "@fluentui/react-components";
import { Library20Regular, Warning20Regular, Options20Regular, CheckmarkCircle48Color} from "@fluentui/react-icons";
import './App.css';

function Posts() {
  return (
    <div>
        <CSPosts />
    </div>
  );
}

function CSPosts() {
  return (
    <div>
        <Title1>New Posts</Title1>
        <div style={{paddingTop: '15px'}}>
          <PostCard title='Test Card 1' desc='This is a test card to make sure that the input is working (kind of) as intended.' img='https://cdn.varomicgames.com/images/ProjectZ-Promo.webp'/>
        </div>
    </div>
  );
}

function PostCard({ title, desc, img }: { title: string; desc: string; img?: string; }) {
  const [isReportModalOpen, setReportModalOpen] = React.useState(false);
  const [isReportConfirmModalOpen, setReportConfirmModalOpen] = React.useState(false);

  const handleReportSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setReportConfirmModalOpen(true);
    setReportModalOpen(false);
  };

    return (
        <div className='postCard'>
            <Image width="100%" src={img} alt="Post Image" fit='contain' style={{borderRadius: '5px'}}/>
            <Title3>{title}</Title3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <Text>{desc}</Text>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Button appearance='primary'>Learn More</Button>
                <Menu>
                  <MenuTrigger>
                    <Button appearance='subtle' style={{ marginLeft: '5px' }} icon={<Options20Regular />}/>
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem icon={<Library20Regular />}>Save Post</MenuItem>
                      <MenuItem icon={<Warning20Regular />} onClick={() => setReportModalOpen(!isReportModalOpen)}>Report Post</MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
                <Dialog open={isReportModalOpen} onOpenChange={(event, data) => setReportModalOpen(data.open)}>
                  <DialogSurface>
                    <form onSubmit={handleReportSubmit}>
                      <DialogBody>
                        <DialogTitle>Report Post</DialogTitle>
                        <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                          <Text>Reporting this post will require us to review this report. Any reports that aren't legit will cause your account to be flagged and blocked from sending reports.</Text>
                          <Divider style={{marginBottom: '15px', marginTop: '15px'}}/>
                          <Field label={"Select a category"} required>
                            <RadioGroup required>
                              <Radio value={"spam"} label={"Spam"}/>
                              <Radio value={"offensive"} label={"Offensive or Harmful Content"}/>
                              <Radio value={"misinformation"} label={"Misinformation"}/>
                              <Radio value={"safety concerns"} label={"Safety Concerns"}/>
                              <Radio value={"duplicate"} label={"Duplicate Post"}/>
                              <Radio value={"other"} label={"Other"}/>
                            </RadioGroup>
                          </Field>
                          <Field label={"Additional Details (Optional)"}>
                            <Textarea placeholder='Details...'>
                            </Textarea>
                          </Field>
                        </DialogContent>
                        <DialogActions>
                          <Button appearance='primary' type='submit'>Report</Button>
                          <Button appearance='secondary' onClick={() => setReportModalOpen(false)}>Cancel</Button>
                        </DialogActions>
                      </DialogBody>
                    </form>
                  </DialogSurface>  
                </Dialog>
                <Dialog open={isReportConfirmModalOpen} onOpenChange={(event, data) => setReportConfirmModalOpen(data.open)}>
                  <DialogSurface>
                    <DialogBody>
                      <DialogTitle>Report Sent</DialogTitle>
                        <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                          <CheckmarkCircle48Color/>
                          <Text style={{marginTop: '15px'}}>Your report has been succesfully sent and will be under review shortly.</Text>
                        </DialogContent>
                        <DialogActions>
                          <Button appearance='primary' onClick={() => { setReportConfirmModalOpen(false); }}>Close</Button>
                        </DialogActions>
                    </DialogBody>
                  </DialogSurface>  
                </Dialog>
              </div>
            </div>
        </div>
    );
}

export default Posts;