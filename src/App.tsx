import Home from './Home';
import SignIn from './components/SignIn';
import { Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="content" style={{width: '100%'}}>
          <Routes>
            <Route path='/auth' element={<SignIn/>}/>
            <Route path="/*" element={<Home />} />
          </Routes>
        </div>
    </div>
  );
}

export default App;