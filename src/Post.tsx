import { Title1, Image, Divider, Title2, Text, List, ListItem, Title3 } from "@fluentui/react-components";
import React  from "react";

export default function Post()
{
    return(
        <div>
            <Title1>Event Title</Title1>
            <Divider style={{marginTop: '15px', marginBottom: '15px'}}/>
            <div style={{display: 'flex'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Image style={{maxWidth: '600px'}} fit='contain' src="https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2F8_Pikes%2520Peak-Garden%2520of%2520the%2520Gods.jpg&w=2048&q=75" alt="Event Keyart"/>
                    <Title2 style={{marginTop: '15px'}}>Descripton</Title2>
                    <Divider style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <Text>This is a test card to make sure that the input is working (kind of) as intended.</Text>
                </div>
                <div style={{marginLeft: '15px'}}>
                    <div>
                        <Title2>Participants</Title2>
                        <Title3 style={{alignSelf: 'end', marginLeft: '16px'}}>00/00</Title3>
                    </div>
                    <List>
                        <ListItem>
                            Person
                        </ListItem>
                    </List>
                </div>
            </div>
        </div>
    );
}