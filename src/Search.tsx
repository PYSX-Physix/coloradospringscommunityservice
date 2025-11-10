import React from 'react';
import { SearchBox } from '@fluentui/react-components';

function Search() {
  return (
    <div style={{ padding: '20px' }}>
      <SearchBox placeholder="Search posts..." />
    </div>
  );
}

export default Search;