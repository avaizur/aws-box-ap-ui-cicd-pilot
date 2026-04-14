import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import { MenuIcon } from '../../components/layout/Sidebar/Sidebar';
import styles from './LandingPage.module.scss';

export default function LandingPage() {
  return (
    <PageLayout title="">
      <br/><br/><br/><br/>
      <div className={styles.cardsRow}>
        <Link to="/initiatives/create" className={styles.cardLink}>
          <Card className={styles.landingCard} noPadding>
            <div className={styles.cardInner}>
              <div className={styles.cardIconLandscape} aria-hidden="true">
                <MenuIcon type="createInitiative" />
              </div>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>Create Initiative</h3>
                <p className={styles.cardDescription}>
                  Start a new initiative and capture submission details, partners, and solution information.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/initiatives" className={styles.cardLink}>
          <Card className={styles.landingCard} noPadding>
            <div className={styles.cardInner}>
              <div className={styles.cardIconLandscape} aria-hidden="true">
                <MenuIcon type="initiative" />
              </div>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>Initiatives</h3>
                <p className={styles.cardDescription}>
                  View and manage existing initiatives, including status and partner summaries.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </PageLayout>
  );
}
