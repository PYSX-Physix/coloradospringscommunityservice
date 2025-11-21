import Posts from './Posts';
import Search from './Search';
import YourPosts from './YourPosts';
import About from './About'
import Policies from './Policies';
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
  MessageBarBody
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
  else if (location.pathname === '/about/policies') selectedValue = POLICIESMENU;
  else if (location.pathname === '/announcements') selectedValue = ANNOUCEMENTS;
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
            <NavItem as="a" href="/search" value={SEARCHMENU} icon={<SearchSparkle20Color />}>
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
            <NavItem as='a' href='/about/policies' value={POLICIESMENU} icon={<DocumentMultiple20Filled/>}>
              Policies
            </NavItem>
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
            <Route path="/about/policies" element={<Policies/>}/>
            <Route path='/post' element={<Post/>}/>
            <Route path='/announcements' element={<Announcements/>}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;