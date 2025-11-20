import { Card, CardHeader, Text, Title1, Title3 } from "@fluentui/react-components";
import { WrenchScrewdriver24Color } from "@fluentui/react-icons";

export default function Announcements()
{
    return(
        <div>
            <Title1>Announcements</Title1>
            <Card>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Major Backend Update: V11.20.2025.02</Title3>}/>
                <p>
                    <Text>
                        Hey everyone! We have made a major change the backend of the site. Previously we were using the "Create React App" package which had depricated packages that
                        were vulnerable and were a security risk. To fix this major issue, we migrated the website to Vite + React to mitigate these security risks. We are now using 
                        packages that are maintained and up-to-date to keep you safe while on this site. 
                    </Text>
                </p>
            </Card>
            <Card>
                <CardHeader header={<Title3><WrenchScrewdriver24Color /> Frontend Update: V11.20.2025.01</Title3>}/>
                <p>
                    <Text>
                        <strong>Change:</strong> The "post" page shows real data from a post rather than dummy data.<br/>
                        <strong>Fix:</strong> Fixed a minor issue with the "View Post" button is the "Your Post" page.<br/>
                    </Text>
                </p>
            </Card>
            <Card>
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
            <Card>
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