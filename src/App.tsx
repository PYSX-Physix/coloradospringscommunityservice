import React from 'react';
import { DrawerProps } from "@fluentui/react-components";
import logo from './logo.svg';
import './App.css';
import {
  AppItem,
  Hamburger,
  NavCategory,
  NavCategoryItem,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  NavSubItem,
  NavSubItemGroup,
  Tooltip
} from "@fluentui/react-components";

import { Home24Color, Person32Color, SearchSparkle24Color} from "@fluentui/react-icons"


type DrawerType = Required<DrawerProps>["type"];

function App() {

  const [enabledLinks] = React.useState(true);
  const [isMultiple] = React.useState(true);

  const linkDestination = enabledLinks ? "https://www.bing.com" : "";

  return (
    <div className="App">
      <div className='root'>
        <NavDrawer className='nav' type='inline' open={true} multiple={isMultiple} defaultSelectedValue='1'>
          <NavDrawerBody>
            <AppItem
              icon={<Person32Color />}
              as="a"
              href={linkDestination}
            >
              Contoso HR
            </AppItem>

            <NavSectionHeader>Menu</NavSectionHeader>
            <NavItem href={""} value={'1'} icon={<Home24Color/>}>
              Posts
            </NavItem>
            <NavItem href={""} value={'2'} icon={<SearchSparkle24Color />}>
              Search
            </NavItem>
          </NavDrawerBody>
        </NavDrawer>
        <div className='content'>
        </div>
      </div>
    </div>
  );
}

export default App;
