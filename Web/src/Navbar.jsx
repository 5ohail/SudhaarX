import{NavLink} from "react-router-dom";
 function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo"><img src="https://github.com/5ohail/SudhaarX/blob/main/MyApp/assets/images/SudhaarX.png?raw=true" alt="SudhaarX" /></div>

      <ul className="nav-links">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/report">Report an Issue</NavLink></li>
        <li><NavLink to="/explore">Explore Issue</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
      </ul>

      <div className="profile"></div>
    </nav>
  );
}

export default Navbar;