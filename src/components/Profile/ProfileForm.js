import { useContext, useRef, useState } from 'react';
import AuthContext from '../../store/authContext';
import classes from './ProfileForm.module.css';

const ProfileForm = () => {
  const passwordRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const authCtx = useContext(AuthContext);

  const passwordChangeHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:update?key=[API_KEY]',
        {
          method: 'POST',
          body: JSON.stringify({
            idToken: authCtx.token,
            password: passwordRef.current.value,
            returnSecureToken: true,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.json();

      if (!response.ok) {
        throw new Error(data.error.message || 'Cannot change password');
      }

      authCtx.loginHandler(data.idToken);
      setIsLoading(false);
    } catch (error) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <form className={classes.form} onSubmit={passwordChangeHandler}>
      <div className={classes.control}>
        <label htmlFor='new-password'>New Password</label>
        <input type='password' id='new-password' ref={passwordRef} required />
      </div>
      <div className={classes.action}>
        {isLoading ? (
          <p style={{ color: 'white' }}>Loading...</p>
        ) : (
          <button>Change Password</button>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;
