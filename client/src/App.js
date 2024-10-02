import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginButton from './components/LoginButton';

function App() {
  return (
    <GoogleOAuthProvider clientId="SET_CLIENT_ID_HERE">
      <div className="App">
        <h1>Login with Google</h1>
        <LoginButton />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
