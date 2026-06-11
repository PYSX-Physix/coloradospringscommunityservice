import Home from './Home';
import SignIn from './components/SignIn';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="h-screen overflow-hidden w-full">
      <Routes>
        <Route path='/auth' element={<SignIn/>}/>
        <Route path="/*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;