import { ReactNode } from 'react';

declare module '@react-oauth/google' {
  interface GoogleLoginProps {
    onSuccess: (credentialResponse: any) => void;
    onError: () => void;
    useOneTap?: boolean;
    auto_select?: boolean;
    clientId: string;
    children?: ReactNode;
  }

  export const GoogleLogin: (props: GoogleLoginProps) => React.JSX.Element;
}