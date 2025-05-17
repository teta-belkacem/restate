
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <div>
        <p>جميع الحقوق محفوظة © {currentYear} - ReState</p>
      </div>
    </footer>
  );
};

export default Footer;