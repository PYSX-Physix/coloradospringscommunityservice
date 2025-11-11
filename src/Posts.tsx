import React from 'react';
import { Title1, Title3, Text, Button, Image, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from "@fluentui/react-components";
import { Library20Color, Options20Regular } from "@fluentui/react-icons";
import './App.css';

function Posts() {
  return (
    <div>
        <CSPosts />
    </div>
  );
}

function CSPosts() {
  // This is a placeholder for Community Service Posts component
  return (
    <div>
        <Title1>New Posts</Title1>
        <div style={{paddingTop: '15px'}}>
          <PostCard title='Test Card 1' desc='This is a test card to make sure that the input is working (kind of) as intended.' img='https://cdn.varomicgames.com/images/ProjectZ-Promo.webp'/>
        </div>
    </div>
  );
}

function PostCard({ title, desc, img }: { title?: string; desc?: string; img?: string; }) {
    return (
        <div className='postCard'>
            <Image width="100%" src={img} alt="Post Image" fit='contain' style={{borderRadius: '5px'}}/>
            <Title3>{title}</Title3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <Text>{desc}</Text>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Button appearance='secondary'>Learn More</Button>
                <Menu>
                  <MenuTrigger>
                    <Button appearance='subtle' style={{ marginLeft: 'auto' }} icon={<Options20Regular />}/>
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem icon={<Library20Color />}>Save Post</MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              </div>
            </div>
        </div>
    );
}

export default Posts;