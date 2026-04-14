import { formatDate } from '../../../utils/dateUtils';

export default function DateCellRenderer({ value }) {
  return <span>{formatDate(value)}</span>;
}










