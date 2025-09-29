// Navbar.tsx
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>K. Mahatdachkul</div>
      <nav className={styles.menu}>
        <a href="/">หน้าแรก</a>
        <a href="/calculator">แอพพลิเคชัน</a>
        <a href="/about">เกี่ยวกับฉัน</a>
        <a href="/email">อีเมล</a>
      </nav>
    </header>
  );
}
