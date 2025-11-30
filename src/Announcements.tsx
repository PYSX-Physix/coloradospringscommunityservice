import { Card, CardHeader, Text, Title1, Title3 } from "@fluentui/react-components";
import { WrenchScrewdriver24Color } from "@fluentui/react-icons";

export default function Announcements()
{
    return(
        <div>
            <Title1>Announcements</Title1>
            <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Major Backend Update: V11.29.2025.01</Title3>}/>
                <p>
                    <Text>
                        Hey everyone! We've added new features to help with verification of attending events. The event organizer can now mark attendees as "attended" or "no-show". This will help organizers keep track of who actually participated in their events.<br/>
                        Here are the new features added in this update:<br/>
                        <strong>Addition:</strong> Event organizers can now mark attendees as "attended" or "no-show".<br/>
                        <strong>Addition:</strong> Attendees can view their attendance status for events they signed up for.<br/>
                        <strong>Fix:</strong> Resolved minor bugs related to event sign-up and attendance tracking.<br/>
                        <strong>Addition:</strong> Event organizers can print attendance reports for their events.<br/>
                        <strong>Change:</strong> Improved the user interface for event sign-up and attendance tracking.<br/>
                        <strong>Work-In-Progress:</strong> We're working on adding calendar events so you can easily add your signed-up events to your personal calendar.<br/>
                        <strong>Work-In-Progress:</strong> We're also working on email notifications to remind you of upcoming events you've signed up for.<br/>
                        <br/>
                        We hope these new features enhance your experience on our platform. As always, thank you for being part of our community! 
                    </Text>
                </p>
            </Card>
            <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Major Update: V11.25.2025.01</Title3>}/>
                <p>
                    <Text>
                        Hey everyone! I'm so excited to finally say this is the first version of the app that is in beta! You're able to sign up with email and passwords.
                        If anyone is curious about how we'll store your passwords, they will be hashed meaning it's hard for bad actors to decrypt passwords easily.
                        You're now able to start posting (only if you're signed in) keep in mind posts can be reported and reviewed.<br/>
                        Here some of the new, fixed, and modified things are in this update!<br/>
                        <strong>Addition:</strong> Authentication is now available!<br/>
                        <strong>Addition:</strong> We now show user created posts and have removed all sample data so say bye to that one card on the post screen.<br/>
                        <strong>Addition:</strong> You're now able to sign-up for events! This will show your name on a list with others.<br/>
                        <strong>Change:</strong> The "Your Posts" page recived and new layout! It's more organized and sorted out then our original layouts.<br/>
                        <strong>Issue:</strong> The "Sign-Up" button is clipped out of the users view. You're able to zoom out if you're on a small display to fix the issue.<br/>
                        <strong>Disabled:</strong> We disabled the Search feature since that is not our main priority at the moment.<br/>
                        <br/>
                        A lot has gone into this update and we can't wait for you guys to start creating community service events/opportunities. Keep in mind this site is free and will always be free
                        to use. Good luck everyone!
                    </Text>
                </p>
            </Card>
            <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Major Backend Update: V11.20.2025.02</Title3>}/>
                <p>
                    <Text>
                        Hey everyone! We have made a major change the backend of the site. Previously we were using the "Create React App" package which had depricated packages that
                        were vulnerable and were a security risk. To fix this major issue, we migrated the website to Vite + React to mitigate these security risks. We are now using 
                        packages that are maintained and up-to-date to keep you safe while on this site. 
                    </Text>
                </p>
            </Card>
            <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Frontend Update: V11.20.2025.01</Title3>}/>
                <p>
                    <Text>
                        <strong>Change:</strong> The "post" page shows real data from a post rather than dummy data.<br/>
                        <strong>Fix:</strong> Fixed a minor issue with the "View Post" button is the "Your Post" page.<br/>
                    </Text>
                </p>
            </Card>
            <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Backend Update: V11.18.2025.01</Title3>}/>
                <p>
                    <Text>
                        Hey everyone! I've been working behind the scenes to get posting your service opportunities onto our system. 
                        I've been working on creating an linking databases to this site so your posts are saved and shown to everyone. 
                        You're able to create your posts however they won't show up because this site is not made to find your posts yet.
                        I'll be working on making sure your posts are visable, editable, viewable, and joinable for others. Anyway here are the changes.<br/><br/>
                        <strong>Addition:</strong> When creating a form, it now creates a post in our database.<br/>
                        <strong>Note:</strong> Creating a post for community service events it's only stored in our database and will not display at the moment.<br/>
                    </Text>
                </p>
            </Card>
            <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Minor Update: V11.17.2025.03</Title3>}/>
                <p>
                    <Text>
                        <strong>Fix:</strong> Height of the page doesn't adjust to the size of the display.<br/>
                        <strong>Addition:</strong> Announcements page. This will be used to show update patch notes and disclosures.<br/>
                        <strong>Temp Additon:</strong> Warning for the application being in development.
                    </Text>
                </p>
            </Card>
        </div>
    );
}
