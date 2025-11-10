import React from 'react';
import { Title1, Button } from "@fluentui/react-components";
import { AddCircleColor } from "@fluentui/react-icons";


function Posts() {
  return (
    <div>
      <Title1>Posts</Title1>
      <Button appearance='primary' style={{ marginLeft: "16px"}} icon={<AddCircleColor />}>Create Post</Button>
      <CSPosts />
    </div>
  );
}

function CSPosts() {
  // This is a placeholder for Community Service Posts component
  return <div>CS Posts Component</div>;
}

export default Posts;