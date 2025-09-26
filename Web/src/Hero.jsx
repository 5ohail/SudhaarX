import {Link} from "react-router-dom"
function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Make Your Voice Heard</h1>
        <p>Your community, your platform. Report civic issues, track progress, and help build a better neighborhood.</p>
         <Link to="/report">
        <button className="btn-primary">Report an Issue Now</button>
        </Link>
      </div>
    </section>
  );
}
export default Hero;
