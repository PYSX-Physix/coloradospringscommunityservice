import React from 'react';
import Posts from './Posts';
import Search from './Search';
import YourPosts from './YourPosts';
import { Privacy, Terms } from './Policies';
import AdminPanel from './admin';
import About from './About'
import Profile from './Profile';
import { useSession, signOut } from "./lib/auth-client";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
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
  NavCategory,
  NavCategoryItem,
  NavSubItem,
  NavSubItemGroup,
  MenuDivider,
  Tooltip,
  Hamburger,
  NavDrawerFooter,
  Tag
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
  MegaphoneLoud20Color,
  ArrowExitRegular,
  QuestionCircle20Color, Shield20Color
} from "@fluentui/react-icons";
import Post from './Post';
import Announcements from './Announcements';
import { HelpHome } from './Help';
import { useState } from 'react';
import NotificationPanel from './components/NotificationPanel';

const ANNOUCEMENTS = '0'
const POSTSMENU = '1';
const SEARCHMENU = '2';
const SAVEDPOSTSMENU = '3';
const YOURPOSTSMENU = '4';
const ABOUTMENU = '5'
const POLICIESMENU = '6'
const PRIVACYPOLICY = '7'
const TERMSOFSERVICE = '8'
const PROFILE = '9'
const HELPHOME = '10'
const ADMINPANEL = '11';

function Home() {
  const [ isOpen, setIsOpen ] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isAdmin = !!(session?.user as any)?.isAdmin;

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Determine which nav item should be active
  let selectedValue = POSTSMENU;
  if (location.pathname === '/search') selectedValue = SEARCHMENU;
  else if (location.pathname === '/saved/posts') selectedValue = SAVEDPOSTSMENU;
  else if (location.pathname === '/saved/my-posts') selectedValue = YOURPOSTSMENU;
  else if (location.pathname === '/about') selectedValue = ABOUTMENU;
  else if (location.pathname === '/policies') selectedValue = POLICIESMENU;
  else if (location.pathname === '/announcements') selectedValue = ANNOUCEMENTS;
  else if (location.pathname === '/policies/privacy-policy') selectedValue = PRIVACYPOLICY;
  else if (location.pathname === '/policies/terms-of-service') selectedValue = TERMSOFSERVICE;
  else if (location.pathname === '/profile') selectedValue = PROFILE;
  else if (location.pathname === '/admin') selectedValue = ADMINPANEL;
  else if (location.pathname === '/') selectedValue = POSTSMENU;
  else selectedValue = '50';

  return (
    <div className="App">
      <div className="root">
        <NavDrawer
          className="nav"
          type="inline"
          open={isOpen}
          multiple={true}
          selectedValue={selectedValue}
        >
          <NavDrawerHeader>
            {isMobile && <Tooltip content="Close navigation" relationship='label'>
              <Hamburger onClick={() => setIsOpen(!isOpen)}/>
            </Tooltip>}
            
            <div style={{ display: 'flex', gap: '8px'}}>
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
                        <MenuItemLink icon={<SettingsColor/>} href='/settings'>Settings</MenuItemLink>
                        <MenuDivider/>
                        <MenuItem icon={<ArrowExitRegular/>} onClick={handleSignOut}>Sign Out</MenuItem>
                      </>
                    ) : (
                      <MenuItemLink href='/auth'>Sign In</MenuItemLink>
                    )}
                  </MenuList>
                </MenuPopover>
              </Menu>

              {session && <div style={{marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto'}}><NotificationPanel /></div>}
            </div>
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
            <NavItem as='a' href="/saved/my-posts" value={YOURPOSTSMENU} icon={<ClipboardTextEdit20Color />}>
              My Posts
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
            <NavItem as='a' href='/help' value={HELPHOME} icon={<QuestionCircle20Color/>}>Help</NavItem>
            {isAdmin && (
              <>
              <NavDivider/>
              <NavSectionHeader>Administration</NavSectionHeader>
              <NavItem as='a' href='/admin' value={ADMINPANEL} icon={<Shield20Color/>}>
                Admin Panel
              </NavItem>
              </>
            )}
          </NavDrawerBody>
          <NavDrawerFooter style={{marginBottom: '6px'}}>
            <Tag shape='circular' appearance='brand'>App in beta</Tag>
          </NavDrawerFooter>
        </NavDrawer>

        <div className="content">
            {!isOpen && (
                <div className="hamburger-container">
                <Tooltip content={"Open navigation"} relationship='label'>
                    <Hamburger onClick={() => setIsOpen(!isOpen)}/>
                </Tooltip>
                </div>
            )}
            <div className="content-scroll">
                <Routes>
                    <Route path="/" element={<Posts />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/saved/my-posts" element={<YourPosts />} />
                    <Route path="/about" element={<About/>}/>
                    <Route path='/post' element={<Post/>}/>
                    <Route path='/announcements' element={<Announcements/>}/>
                    <Route path='/policies/privacy-policy' element={<Privacy/>}/>
                    <Route path='/policies/terms-of-service' element={<Terms/>}/>
                    <Route path='/profile' element={<Profile/>}/>
                    <Route path='/help' element={<HelpHome/>}/>
                    <Route path="/admin" element={<AdminPanel />} />
                </Routes>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;