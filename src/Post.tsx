import { Title1, Image, Divider, Title2, Text, List, ListItem, Title3, Persona, Button } from "@fluentui/react-components";
import { Calendar16Color, LocationRipple16Color } from "@fluentui/react-icons";
import React  from "react";

export default function Post()
{
    return(
        <div>
            <Title1>Event Title</Title1>
            <Divider style={{marginTop: '15px', marginBottom: '15px'}}/>
            <div style={{display: 'flex'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Image style={{maxWidth: '900px', borderRadius: '5px'}} fit='contain' src="https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2F8_Pikes%2520Peak-Garden%2520of%2520the%2520Gods.jpg&w=2048&q=75" alt="Event Keyart"/>
                    <Title2 style={{marginTop: '15px'}}>Descripton</Title2>
                    <Divider style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <Text>This is a test card to make sure that the input is working (kind of) as intended.</Text>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', flexDirection: 'row', marginTop: '16px'}}>
                            <div>
                                <Calendar16Color style={{marginRight: '16px'}}/>
                                <Text><strong>Starts</strong>: November 25, 2025, 9:30am</Text>
                            </div>
                            <div style={{marginLeft: '16px'}}>
                                <Text><strong>Ends</strong>: November 25, 2025, 12:00pm</Text>
                            </div>
                        </div>
                        <div style={{marginTop: '16px'}}>
                            <Text><LocationRipple16Color style={{marginRight: '16px'}}/><strong>Location:</strong> 1234, Main Street, Colorado Springs, Colorado</Text>
                        </div>
                        <Persona name="Test User" style={{marginTop: '16px'}}/>
                        <Button>Sign-Up</Button>
                    </div>
                </div>
                <div style={{marginLeft: '15px', width: '100%'}}>
                    <div style={{justifyContent: 'space-between', width: '100%'}}>
                        <Title2 style={{textAlign: 'left', marginRight: '64px'}}>Participants</Title2>
                        <Title3 style={{textAlign: 'right'}}>3/5</Title3>
                    </div>
                    <Divider style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <List>
                        <ListItem>
                            <Persona name="Other Test User 1" style={{marginTop: '16px'}}/>
                        </ListItem>
                        <ListItem>
                            <Persona name="Other Test User 2" style={{marginTop: '16px'}}/>
                        </ListItem>
                        <ListItem>
                            <Persona name="Other Test User 3" style={{marginTop: '16px'}}/>
                        </ListItem>
                    </List>
                </div>
            </div>
        </div>
    );
}