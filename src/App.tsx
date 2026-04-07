import Home from './Home';
import SignIn from './components/SignIn';
import { Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App bg-white dark:bg-gray-800">
      <div className="root">
        <div className="content" style={{width: '100%'}}>
          <Routes>
            <Route path='/auth' element={<SignIn/>}/>
            <Route path="/*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;