import { Divider, SearchBox, Title1 } from '@fluentui/react-components';

function Search() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Title1>Search</Title1>
      <Divider style={{marginTop: '15px', marginBottom: '15px'}}/>
      <SearchBox placeholder="Search posts..." />
    </div>
  );
}

export default Search;