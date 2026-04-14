import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import MessagePanel from '../../components/MessagePanel/MessagePanel';
import * as authService from '../../services/auth.service';
import { useReferenceValues } from '../../contexts/ReferenceValuesContext';
import styles from './CreateAccountPage.module.scss';

export default function CreateAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getValuesByKey, loading: referenceValuesLoading } = useReferenceValues();

  // Get role options from reference values
  const roleOptions = useMemo(() => {
    const roleValues = getValuesByKey('user.roles');
    return roleValues.map((rv) => ({
      value: rv.code,
      label: rv.description,
    }));
  }, [getValuesByKey]);


  // Set default role when options are loaded
  useEffect(() => {
    if (roleOptions.length > 0 && !role) {
      setRole(roleOptions[0].value);
    }
  }, [roleOptions, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError({ message: 'Validation failed', errors: [{ field: 'password', message: 'Passwords do not match' }] });
      return;
    }
    setLoading(true);

    try {
      await authService.createAccount(email, password, confirmPassword, displayName, role);
      navigate('/login');
    } catch (error) {
      // Use the full error response if available, otherwise create a simple error object
      if (error.errorResponse) {
        setError(error.errorResponse);
      } else {
        setError({ message: error.message || 'Failed to create account. Please try again.', errors: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="Create Account">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={roleOptions}
            disabled={referenceValuesLoading}
          />
          {error && <MessagePanel message={error} type="error" />}
          <Button type="submit" disabled={loading || referenceValuesLoading}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
          <div className={styles.links}>
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}







