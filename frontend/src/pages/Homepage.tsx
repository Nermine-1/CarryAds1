import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { FaBullhorn, FaStore, FaChartLine, FaCogs, FaSignInAlt, FaChevronDown, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 
import '../styles/pages/HomePage.css'; 

const HomePage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const heroImageVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
  };

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="navbar"
      >
        <div className="navbar-logo">CarryAds</div>
        <ul className="navbar-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li className="navbar-auth">
            <motion.div
              className="dropdown-toggle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignInAlt className="icon" />
              <span>Login / Sign Up</span>
              <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <FaChevronDown />
              </motion.span>
            </motion.div>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="dropdown-menu"
                >
                  <Link to="/login/annonceur">Customer</Link>
                  <Link to="/login/distributeur">Distributor</Link>
                  <Link to="/login/commercial">Sales</Link>
                  {/* <Link to="/login/admin">Administrator</Link> */}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        </ul>
      </motion.nav>

      {/* Hero Section */}
      <motion.section className="hero-section" variants={containerVariants} initial="hidden" animate="show">
        <motion.div className="hero-content">
          <motion.h1 variants={itemVariants}>
            Your message, to the right person, at the right time.
          </motion.h1>
          <motion.p variants={itemVariants}>
            CarryAds revolutionizes advertising by turning everyday objects into powerful communication channels.
          </motion.p>
          <motion.div className="hero-buttons" variants={itemVariants}>
            <motion.button
              className="cta-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup/annonceur"
                style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Create a Campaign <FaArrowRight />
              </Link>
            </motion.button>
            <motion.button className="cta-btn secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signup/distributeur">
                Become a Distributor
              </Link>
            </motion.button>
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-image-placeholder"
          variants={heroImageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="image-animation-box">
            <img src="/src/assets/hero-image.png" alt="Hero" className="hero-image" />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">How it works?</h2>
        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div className="feature-card" variants={itemVariants}>
            <FaBullhorn className="feature-icon" />
            <h3>For Customers</h3>
            <p>Create and manage your ad campaigns, select your target distributors, and track performance in real time.</p>
          </motion.div>
          <motion.div className="feature-card" variants={itemVariants}>
            <FaStore className="feature-icon" />
            <h3>For Distributors</h3>
            <p>Monetize your packaging by displaying relevant ads to your clients and generate additional revenue.</p>
          </motion.div>
          <motion.div className="feature-card" variants={itemVariants}>
            <FaChartLine className="feature-icon" />
            <h3>Analytics & Tracking</h3>
            <p>Access intuitive dashboards to measure ad impact and optimize your strategies.</p>
          </motion.div>
          <motion.div className="feature-card" variants={itemVariants}>
            <FaCogs className="feature-icon" />
            <h3>Simplified Management</h3>
            <p>From billing to payments, our platform manages the entire process transparently for you.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="cta-title">Ready to get started?</h2>
        <p className="cta-subtitle">
          Whether you are a customer or a distributor, join the CarryAds community today.
        </p>
        <div className="cta-buttons">
          <motion.button className="cta-btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/signup/annonceur" style={{ textDecoration: 'none', color: 'white' }}>
              Sign up as Customer
            </Link>
          </motion.button>
          <motion.button className="cta-btn secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/signup/distributeur">
              Sign up as Distributor
            </Link>
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 CarryAds. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
