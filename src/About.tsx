import { Text, Title1 } from "@fluentui/react-components";

function About()
{
    return(
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <Title1>About Us</Title1>
            <Text>This site was created on November 9, 2025 because a kids dad and grandmother were complaining about not being able to find a community service
                opportunity because of how decentralized it was. To fix this issue the kid create a website (this site) to fix this issue.
            </Text>
        </div>
    )
}

export default About;