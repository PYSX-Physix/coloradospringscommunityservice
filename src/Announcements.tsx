import { Card, CardHeader, Text, Title1, Title3 } from "@fluentui/react-components";
import { WrenchScrewdriver24Color } from "@fluentui/react-icons";
import React from "react";

export default function Announcements()
{
    return(
        <div>
            <Title1>Announcements</Title1>
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