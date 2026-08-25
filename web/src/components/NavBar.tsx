"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavBar.module.css";

const ENLACES = [
  { href: "/", etiqueta: "PEN" },
  { href: "/usd", etiqueta: "USD" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {ENLACES.map(({ href, etiqueta }) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? styles.activo : styles.link}
        >
          {etiqueta}
        </Link>
      ))}
    </nav>
  );
}
