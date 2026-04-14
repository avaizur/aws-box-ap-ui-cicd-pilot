import Input from '../../../../components/Input/Input';
import styles from '../EditInitiativePage.module.scss';

export default function SolutionTeamStructureTab({ values, onChangeField }) {
  return (
    <div className={styles.form}>

      <Input
        label="Support Model"
        value={values?.supportModel ?? ''}
        onChange={(e) => onChangeField('supportModel', e.target.value)}
      />
      <Input
        label="Opportunity Generation"
        value={values?.opportunityGeneration ?? ''}
        onChange={(e) => onChangeField('opportunityGeneration', e.target.value)}
      />
      <Input
        label="Commercial Agreement"
        value={values?.commercialAgreement ?? ''}
        onChange={(e) => onChangeField('commercialAgreement', e.target.value)}
      />
    </div>
  );
}

