import React from 'react';
import Posts from './Posts';
import Search from './Search';
import SavedPosts from './SavedPosts';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import {
  AppItem,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  NavDivider,
  MenuItemLink,
  MenuTrigger,
  MenuPopover,
  MenuList,
  Menu
} from "@fluentui/react-components";

import {
  Home20Color,
  Person32Color,
  SearchSparkle20Color,
  Document20Color,
  ClipboardTextEdit20Color,
  PersonColor,
  SettingsColor
} from "@fluentui/react-icons";

const POSTSMENU = '1';
const SEARCHMENU = '2';
const SAVEDPOSTSMENU = '3';
const YOURPOSTSMENU = '4';

function App() {
  const location = useLocation();

  // Determine which nav item should be active
  let selectedValue = POSTSMENU;
  if (location.pathname === '/search') selectedValue = SEARCHMENU;
  else if (location.pathname === '/saved/posts') selectedValue = SAVEDPOSTSMENU;
  else if (location.pathname === '/saved/your-posts') selectedValue = YOURPOSTSMENU;

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
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <AppItem icon={<Person32Color />} as="a">Person Name</AppItem>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItemLink icon={<PersonColor />} href='/profile'>Profile</MenuItemLink>
                  <MenuItemLink icon={<SettingsColor />} href='/settings'>Settings</MenuItemLink>
                </MenuList>
              </MenuPopover>
            </Menu>
          </NavDrawerHeader>

          <NavDrawerBody>
            <NavDivider />
            <NavSectionHeader>Menu</NavSectionHeader>

            <NavItem as="a" href="/posts" value={POSTSMENU} icon={<Home20Color />}>
              Posts
            </NavItem>

            <NavItem as="a" href="/search" value={SEARCHMENU} icon={<SearchSparkle20Color />}>
              Search
            </NavItem>

            <NavDivider />
            <NavSectionHeader>Saved</NavSectionHeader>

            <NavItem as="a" href="/saved/posts" value={SAVEDPOSTSMENU} icon={<Document20Color />}>
              Posts
            </NavItem>
            <NavItem as='a' href="/saved/your-posts" value={YOURPOSTSMENU} icon={<ClipboardTextEdit20Color />}>
              Your Posts
            </NavItem>
          </NavDrawerBody>
        </NavDrawer>

        <div className="content">
          <Routes>
            <Route path="/posts" element={<Posts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved/posts" element={<SavedPosts />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;