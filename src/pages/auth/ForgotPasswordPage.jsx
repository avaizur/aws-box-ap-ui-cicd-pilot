import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import * as authService from '../../services/auth.service';
import styles from './ForgotPasswordPage.module.scss';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (error) {
      setError(error.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="Forgot Password">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
          {message && <div className={styles.successMessage}>{message}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
          <div className={styles.links}>
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}










