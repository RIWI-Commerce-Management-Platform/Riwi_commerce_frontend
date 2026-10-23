import { CheckIcon } from "../icons";
import styles from "./Checkbox.module.css";

export default function Checkbox({ label, checked, onChange, ...rest }) {
  return (
    <label className={styles.wrapper}>
      <input type="checkbox" className={styles.native} checked={checked} onChange={onChange} {...rest} />
      <span className={styles.box}>{checked && <CheckIcon size={14} stroke="#fff" />}</span>
      {label}
    </label>
  );
}
