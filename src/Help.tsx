import { Card, CardHeader, CardFooter, Button, Text, Title1, Title3, makeStyles, Divider } from "@fluentui/react-components"

const cardStyles = makeStyles({
      card: {
        width: '400px',
        maxWidth: '100%',
        height: 'fit-content'
      }
    });

export function HelpHome()
{
    const styles = cardStyles();
    return(
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <Title1>Help Page</Title1>
            <Text>
                If you're struggling to navigate this site or need help getting started this is the place to find information.
                If any other sources require you to pay for anything on this site then it's a scam and do not continue the guide.
            </Text>
            <Divider style={{marginTop: '16px', marginBottom: '16px'}}/>
            <div style={{flexDirection: 'row'}}>
                <Card className={styles.card}>
                        <CardHeader
                          header={<Title3>Creating an Event</Title3>}
                          description={<Text>In this tutorial, we will explain how to create an event. This will go over the very basics.</Text>}
                        />
                        <CardFooter>
                          <Button appearance="primary">Learn More</Button>
                          
                        </CardFooter>
                      </Card>
            </div>
        </div>
    )
}