import Input from '../../../../components/Input/Input';
import styles from '../EditInitiativePage.module.scss';

export default function AwsFeedbackTab({ values, onChangeField }) {
  return (
    <div className={styles.form}>
      <Input
        label="AWS Feedback"
        value={values?.awsFeedback ?? ''}
        onChange={(e) => onChangeField('awsFeedback', e.target.value)}
      />
    </div>
  );
}

