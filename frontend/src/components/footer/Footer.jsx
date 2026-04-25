import "./Footer.css"
import { Link } from "react-router-dom";
import {useLocation} from "react-router-dom";

function Footer() {

  const location=useLocation();
  const isExamPage=location.pathname.includes("/dashboard/exam/");
  
    return(
      <div className={`${isExamPage ? "exam-mode" : ""}`}>
        {!isExamPage &&(
        
        <footer >
      <div className="contact-details">
        <div>
          <h5>Contact Us</h5>
          <p>Email: info@oes.com</p>
          <p>Phone: +123 456 7890</p>
        </div>
        <div>
          <h5>Follow Us</h5>
          <p><Link to="https://www.linkedin.com/in/jayanthi-bhukya-498029289/">LinkedIn</Link> | Twitter | <Link to="https://www.instagram.com/harshini_gopisetty/">Instagram</Link></p>
        </div>
        
      </div>
    </footer>
    )}
    </div>
    )
}

export default Footer;