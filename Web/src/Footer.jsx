import{NavLink} from "react-router-dom";
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <h2>SudhaarX</h2>
          <p>Making our city better, together.</p>
        </div>
        <ul>
           <li><NavLink to="/about">About</NavLink></li>
           <li><NavLink to="/contact">Contact</NavLink></li>
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
        </ul>
      </div>

      <p className="footer-bottom">© 2024 CityFix. All rights reserved.</p>
    </footer>
  );
}
export default Footer;