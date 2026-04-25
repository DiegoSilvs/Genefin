import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Card: React.FC<CardProps> = ({ title, value, icon, trend, variant = 'default' }) => {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.value}>{value}</h3>
        {trend && (
          <span className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
