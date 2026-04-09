import Home from './Home';
import SignIn from './components/SignIn';
import { Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="min-h-screen w-screen bg-white text-white dark:bg-neutral-900 dark:text-gray-300">
      <div className="flex min-h-screen w-screen">
        <Routes>
          <Route path='/auth' element={<SignIn/>}/>
          <Route path="/*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;