import React from 'react';
// @ts-ignore - Missing types
import { GoogleLogin } from '@react-oauth/google';
// @ts-ignore - Missing types
import FacebookLogin from 'react-facebook-login';
import styles from './SocialLoginButtons.module.css';

type UserInfo = {
  name: string;
  email: string;
  picture?: string;
};

type Props = {
  onSuccess: (user: UserInfo) => void;
  onError: (error: string) => void;
};

export const SocialLoginButtons = ({ onSuccess, onError }: Props) => {
  const handleGoogleSuccess = (credentialResponse: any) => {
    // Mock response for test/dev
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://via.placeholder.com/150'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    onSuccess(mockUser);
  };

  const handleGoogleError = () => {
    onError('Google login failed');
  };

  const handleFacebookResponse = (response: any) => {
    if (response.accessToken) {
      // Mock response for test/dev
      const mockUser = {
        name: response.name || 'Facebook User',
        email: response.email || 'facebook@example.com',
        picture: response.picture?.data?.url
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      onSuccess(mockUser);
    } else {
      onError('Facebook login failed');
    }
  };

  return (
    <div className={styles.container}>
      {/* @ts-ignore */}
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        auto_select
        clientId="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com" // Test client ID
      />
      <FacebookLogin
        appId="123456789012345" // Test app ID
        autoLoad={false}
        fields="name,email,picture"
        callback={handleFacebookResponse}
        cssClass={styles.facebookButton}
        textButton="Continue with Facebook"
      />
    </div>
  );
};