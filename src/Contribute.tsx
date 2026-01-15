import { Title1, Title2, Text, Divider, Link } from "@fluentui/react-components";

export default function Contribute()
{
    return(
        <div style={{flexDirection: 'column', display: 'flex'}}>
            <Title1>Contributing</Title1>
            <Divider style={{marginTop: '16px', marginBottom: '16px'}}/>
            <Text>If you're wishing to contribute to this project, feel free to contact this email <Link as="a" href=" mailto:llodgical018@gmail.com">llodgical018@gmail.com</Link>.</Text>
            <Title2>Requirements</Title2>
            <Text>You're allowed to contact the email provided without these requirements although, your request will be miminally considered. The following requirements are:</Text>
            <Text>• You must have experience with React, SQL, and TypeScript</Text>
            <Text>• Have some sort of contact, this can be email, text, or a social platform</Text>
            <Text>• Understand Fluent UI design guidelines, and React components</Text>
            <Text>That's it! Hope to hear from you and hopefuly you enjoy contributing to this website.</Text>
        </div>
    );
}