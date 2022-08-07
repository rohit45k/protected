import { useCallback, useEffect, useState } from 'react';
import AuthContext from './authContext';

let timeOut;

const calculateExpireTime = (expiresTime) => {
  const currentTime = new Date().getTime();
  const remainingTime = expiresTime - currentTime;

  return remainingTime;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');

  const remainingTime = calculateExpireTime(localStorage.getItem('expiresIn'));
  if (remainingTime > 1000) {
    return { token: storedToken, duration: remainingTime };
  }

  localStorage.removeItem('token');
  localStorage.removeItem('expiresIn');
  return null;
};

const AuthProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initialToken;
  initialToken = tokenData?.token;
  const [token, setToken] = useState(initialToken);

  const isLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');

    if (timeOut) {
      clearTimeout(timeOut);
    }
  }, []);

  const loginHandler = (token, expiresTime) => {
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('expiresIn', expiresTime);

    const remainingTime = calculateExpireTime(expiresTime);

    if (remainingTime > 0) {
      timeOut = setTimeout(logoutHandler, remainingTime);
    } else {
      logoutHandler();
    }
  };

  useEffect(() => {
    if (tokenData) {
      timeOut = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const authContext = {
    isLoggedIn,
    token,
    loginHandler,
    logoutHandler,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
