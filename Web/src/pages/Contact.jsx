import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

const Contact = () => {
  return (
    <section className="contact">
      <div className="contact-container">
        <h2>Contact Us</h2>
        <p>
          Whether you have a question about our services, need assistance, or
          just want to say hello, we're here to help. Reach out to us through
          any of the channels below.
        </p>
        <div className="contact-section">
          <h3>Get in touch</h3>
          <a href="mailto:support@example.com" className="contact-card">
            <FaEnvelope className="icon email" />
            <span>support@example.com</span>
          </a>
        </div>
        <div className="contact-section">
          <h3>Follow us</h3>

          <a
            href="https://www.facebook.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >
            <FaFacebook className="icon facebook" />
            <span>Facebook</span>
          </a>

          <a
            href="https://www.instagram.com/bhavesh__patel_06"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >
            <FaInstagram className="icon instagram" />
            <span>Instagram</span>
          </a>

          <a
            href="https://twitter.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >
            <FaTwitter className="icon twitter" />
            <span>Twitter</span>
          </a>

          <a
            href="https://www.linkedin.com/in/Bhavesh Dangi"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >
            <FaLinkedin className="icon linkedin" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
