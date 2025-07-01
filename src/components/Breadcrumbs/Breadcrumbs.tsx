import { Link, To } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

type BreadcrumbItem = {
    label: string;
    path: To | (() => void) | { pathname: string; state?: any };
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
};

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    return (
        <nav className={styles.breadcrumbs}>
            {items.map((item, index) => (
                <span key={index} className={styles.breadcrumbItem}>
                    {index > 0 && <span className={styles.separator}>/</span>}
                    {index === items.length - 1 ? (
                        <span className={styles.current}>{item.label}</span>
                    ) : typeof item.path === 'function' ? (
                        <button
                            onClick={item.path}
                            className={styles.linkButton}
                        >
                            {item.label}
                        </button>
                    ) : (
                        <Link
                            to={item.path}
                            className={styles.link}
                            state={typeof item.path === 'object' && 'state' in item.path ? item.path.state : undefined}
                        >
                            {item.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumbs;