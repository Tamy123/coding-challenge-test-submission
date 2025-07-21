import React from 'react';
import styles from './Error.module.css';

interface ErrorMessageProps {
  error: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return (
    <div className={styles.error}>
      {error}
    </div>
  );
};

export default ErrorMessage;