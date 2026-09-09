import React from "react";
import Login from "./Login";

interface RegisterProps {
  onSuccess?: (userData: any, token: string) => void;
  user?: (value: any) => void;
  login?: (value: boolean) => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, user, login }) => {
  const handleSuccess = (userData: any, token: string) => {
    if (onSuccess) {
      onSuccess(userData, token);
    }
    if (user && login) {
      user({ user: userData, token, ok: true });
      login(true);
    }
  };

  return <Login onSuccess={handleSuccess} />;
};

export default Register;