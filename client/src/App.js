import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createContext} from 'react'
import NotFound from './components/NotFound'
import StateProvider from './components/StateProvider'
import Login from './components/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';


function App() {
  const StateContext = createContext()
  
  return (
    <BrowserRouter id="App">
      <StateProvider context={StateContext}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT}>
          <Routes>
            <Route exact path="/" element={<Login context={StateContext} />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </GoogleOAuthProvider>
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
