import './App.css'
import Navbar from './Navbar.jsx'
import Report from "./pages/Report.jsx";
import Explore from "./pages/Explore.jsx";
import About from "./pages/About.jsx";
import Footer from './Footer.jsx'
import Hero from './Hero.jsx'
import Issues  from './Issues.jsx'
import {Routes,Route} from "react-router-dom"
import AllIssues from "./AllIssues.jsx";
import Contact from "./pages/Contact.jsx"

function App() {
  return (
    <>
   <Navbar/>
   <Routes>
     <Route path="/" element={
      <>
      <Hero/>
      <Issues/>
      <Footer/>
       </>}/>
    <Route path="/report" element={<Report/>}/>
    <Route path="/explore" element={<Explore/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/all-issues" element={<AllIssues />} />
     <Route path="/contact" element={<Contact/>} />
   </Routes>

    </>
  )
}

export default App;
