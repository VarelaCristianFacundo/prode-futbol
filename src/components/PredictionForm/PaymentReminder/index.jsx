import { Banknote } from 'lucide-react'
import styles from './PaymentReminder.module.css'

const PaymentReminder = () => {
  return (
    <div className={styles.container}>
      <Banknote className={styles.icon} size={24} />
      <span className={styles.message}>
        <strong>¡No te olvides de abonar la fecha!</strong>
        <br />
        Para que tu participación quede confirmada, acordate de realizar el pago antes del cierre.
      </span>
    </div>
  )
}

export default PaymentReminder
