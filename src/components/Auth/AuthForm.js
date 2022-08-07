import { useState, useRef, useContext } from 'react';
import AuthContext from '../../store/authContext';
import { useHistory } from 'react-router-dom';

import classes from './AuthForm.module.css';

const AuthForm = () => {
  const authCtx = useContext(AuthContext);
  const history = useHistory();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const authUser = async (url) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          email: emailRef.current.value,
          password: passwordRef.current.value,
          returnSecureToken: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || 'Auth Failed');
      }

      const expireTime = new Date(
        new Date().getTime() + +data.expiresIn * 1000
      ).getTime();

      authCtx.loginHandler(data.idToken, expireTime);
      setIsLoading(false);
      history.replace('/');
    } catch (error) {
      setIsLoading(false);
      alert(error.message);
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setIsLoading(true);
    if (isLogin) {
      authUser(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]'
      );
    } else {
      authUser(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]'
      );
    }
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' ref={emailRef} required />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input type='password' id='password' ref={passwordRef} required />
        </div>
        <div className={classes.actions}>
          {isLoading ? (
            <p style={{ color: 'white' }}>Loading...</p>
          ) : (
            <button>{isLogin ? 'Login' : 'Create Account'}</button>
          )}
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
