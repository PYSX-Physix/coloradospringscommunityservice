import React from 'react';
import { Title1, Title2, Title3, Button, Image } from "@fluentui/react-components";
import { AddCircleColor } from "@fluentui/react-icons";
import './App.css';

function Posts() {
  return (
    <div>
        <div style={{alignItems: "left"}}>
            <Title1 style={{marginTop: "15px", marginBottom: "15px"}}>Posts</Title1>
            <Button appearance='primary' style={{ marginLeft: "16px"}} icon={<AddCircleColor />}>Create Post</Button>
        </div>
        <CSPosts />
    </div>
  );
}

function CSPosts() {
  // This is a placeholder for Community Service Posts component
  return (
    <div>
        <Title2>New Posts</Title2>
        <div>
            <PostCard />
        </div>
    </div>
  );
}

function PostCard() {
    return (
        <div className='postCard'>
            <Image width="30%" src="https://cdn.varomicgames.com/images/ProjectZ-Promo.webp" alt="Post Image" fit='contain'/>
            <Title3>Community Service Opportunity</Title3>
            <p>Join us for a day of giving back to the community! We will be helping out at the local food bank and organizing a neighborhood clean-up. All volunteers are welcome!</p>
            <Button appearance='secondary'>Learn More</Button>
        </div>
    );
}

export default Posts;