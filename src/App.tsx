import Posts from './Posts';
import Search from './Search';
import YourPosts from './YourPosts';
import { Privacy, Terms } from './Policies';
import About from './About'
import { useSession, signOut } from "./lib/auth-client"; // Keep this
import SignIn from './components/SignIn';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import {
  AppItem,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavDivider,
  MenuItemLink,
  MenuTrigger,
  MenuPopover,
  MenuList,
  Menu,
  MenuItem,
  NavSectionHeader,
  MessageBar,
  MessageBarTitle,
  MessageBarBody,
  NavCategory,
  NavCategoryItem,
  NavSubItem,
  NavSubItemGroup
} from "@fluentui/react-components";

import {
  Home20Color,
  Person32Color,
  SearchSparkle20Color,
  ClipboardTextEdit20Color,
  PersonColor,
  SettingsColor,
  Info20Filled,
  DocumentMultiple20Filled,
  MegaphoneLoud20Color
} from "@fluentui/react-icons";
import Post from './Post';
import Announcements from './Announcements';

const ANNOUCEMENTS = '0'
const POSTSMENU = '1';
const SEARCHMENU = '2';
const SAVEDPOSTSMENU = '3';
const YOURPOSTSMENU = '4';
const ABOUTMENU = '5'
const POLICIESMENU = '6'
const PRIVACYPOLICY = '7'
const TERMSOFSERVICE = '8'

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Determine which nav item should be active
  let selectedValue = POSTSMENU;
  if (location.pathname === '/search') selectedValue = SEARCHMENU;
  else if (location.pathname === '/saved/posts') selectedValue = SAVEDPOSTSMENU;
  else if (location.pathname === '/saved/your-posts') selectedValue = YOURPOSTSMENU;
  else if (location.pathname === '/about') selectedValue = ABOUTMENU;
  else if (location.pathname === '/policies') selectedValue = POLICIESMENU;
  else if (location.pathname === '/announcements') selectedValue = ANNOUCEMENTS;
  else if (location.pathname === '/policies/privacy-policy') selectedValue = PRIVACYPOLICY;
  else if (location.pathname === '/policies/terms-of-service') selectedValue = TERMSOFSERVICE;
  else if (location.pathname === '/') selectedValue = POSTSMENU;
  else selectedValue = '10'

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
                <AppItem icon={<Person32Color />} as="a">
                  {session?.user?.name || session?.user?.email || "Guest"}
                </AppItem>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {session ? (
                    <>
                      <MenuItemLink icon={<PersonColor />} href='/profile'>Profile</MenuItemLink>
                      <MenuItem icon={<SettingsColor />} onClick={handleSignOut}>Sign Out</MenuItem>
                    </>
                  ) : (
                    <MenuItemLink href='/auth'>Sign In</MenuItemLink>
                  )}
                </MenuList>
              </MenuPopover>
            </Menu>
          </NavDrawerHeader>

          <NavDrawerBody>
            <NavDivider />
            <NavSectionHeader>General</NavSectionHeader>
            <NavItem as="a" href="/announcements" value={ANNOUCEMENTS} icon={<MegaphoneLoud20Color/>}>
              Announcements
            </NavItem>
            <NavItem as="a" href="/" value={POSTSMENU} icon={<Home20Color />}>
              Posts
            </NavItem>
            <NavItem disabled as="a" href="/search" value={SEARCHMENU} icon={<SearchSparkle20Color />}>
              Search
            </NavItem>
            <NavItem as='a' href="/saved/your-posts" value={YOURPOSTSMENU} icon={<ClipboardTextEdit20Color />}>
              Your Posts
            </NavItem>
            <NavDivider/>
            <NavSectionHeader>Info</NavSectionHeader>
            <NavItem as='a' href='/about' value={ABOUTMENU} icon={<Info20Filled/>}>
              About Us
            </NavItem>
            <NavCategory value={POLICIESMENU}>
                  <NavCategoryItem icon={<DocumentMultiple20Filled/>}>
                    Policies
                  </NavCategoryItem>
                  <NavSubItemGroup>
                    <NavSubItem as='a' href='/policies/privacy-policy' value={PRIVACYPOLICY}>
                      Privacy Policy
                    </NavSubItem>
                    <NavSubItem as='a' href='/policies/terms-of-service' value={TERMSOFSERVICE}>
                      Terms of Service
                    </NavSubItem>
                  </NavSubItemGroup>
            </NavCategory>
          </NavDrawerBody>
        </NavDrawer>

        <div className="content" style={{width: '100%'}}>
          <MessageBar intent='warning'>
            <MessageBarBody>
              <MessageBarTitle>Warning:</MessageBarTitle>
              This application is in development and not a complete product. Expect rapid changes since this application is in prototyping. Changes may lead to unexpected bugs and issues because this application is unstable.
            </MessageBarBody>
          </MessageBar>
          <Routes>
            <Route path='/auth' element={<SignIn/>}/>
            <Route path="/" element={<Posts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved/your-posts" element={<YourPosts />} />
            <Route path="/about" element={<About/>}/>
            <Route path='/post' element={<Post/>}/>
            <Route path='/announcements' element={<Announcements/>}/>
            <Route path='/policies/privacy-policy' element={<Privacy/>}/>
            <Route path='/policies/terms-of-service' element={<Terms/>}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;