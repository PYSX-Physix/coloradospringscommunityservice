import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import {
  AppItem,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  Title1,
  Button
} from "@fluentui/react-components";

import {
  Home24Color,
  Person32Color,
  SearchSparkle24Color, 
  AddCircleColor
} from "@fluentui/react-icons";

const POSTSMENU = '1';
const SEARCHMENU = '2';
const SAVEDPOSTSMENU = '3';

function App() {
  const location = useLocation();

  // Determine which nav item should be active
  let selectedValue = POSTSMENU;
  if (location.pathname === '/search') selectedValue = SEARCHMENU;
  else if (location.pathname === '/saved-posts') selectedValue = SAVEDPOSTSMENU;

  return (
    <div className="App">
      <div className="root">
        <NavDrawer
          className="nav"
          type="inline"
          open={true}
          multiple={true}
          selectedValue={selectedValue}
        >
          <NavDrawerHeader>
            <AppItem
              icon={<Person32Color />}
              as="a"
            >
              Person Name
            </AppItem>
          </NavDrawerHeader>

          <NavDrawerBody>
            <NavSectionHeader>Menu</NavSectionHeader>

            <NavItem as="a" href="/posts" value={POSTSMENU} icon={<Home24Color />}>
              Posts
            </NavItem>

            <NavItem as="a" href="/search" value={SEARCHMENU} icon={<SearchSparkle24Color />}>
              Search
            </NavItem>

            <NavSectionHeader>Saved</NavSectionHeader>

            <NavItem as="a" href="/saved-posts" value={SAVEDPOSTSMENU} icon={<Home24Color />}>
              Saved Posts
            </NavItem>
          </NavDrawerBody>
        </NavDrawer>

        <div className="content">
          <Routes>
            <Route path="/posts" element={<Posts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved-posts" element={<SavedPosts />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function Search() {
  return <div>Search Page</div>;
}

function SavedPosts() {
  return <div>Saved Posts Page</div>;
}

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

export default App;
