import { useState } from "react";
import { useNavigate } from "react-router-dom";

const issues = [
  {
    title: "Malfunctioning Street Lights",
    description: "Report street lights that are out of order, blinking, or timed incorrectly.",
    image: "/images/street light.jpg"
  },
  {
    title: "Potholes",
    description: "Alert the city to dangerous potholes on roads, bike lanes, and sidewalks.",
    image: "/images/pathholes.jpg"
  },
  {
    title: "Garbage",
    description: "Report public trash cans that are full and need to be emptied.",
    image: "/images/dustbin.jpg"
  },
  {
    title: "Miscellaneous",
    description: "Report broken trees,  Animal dead bodies etc",
    image: "/images/miss.jpg"
  },
  {
    title: "Sewerage Issue",
    description: "Report dirty or contaminated water in public areas.",
    image: "/images/dirtywater.jpg"
  }
];

 function Issues() {
  const [IssCount, setIssCount] = useState(3)
    const navigate = useNavigate();

  const handleReportClick = (title) => {
    navigate("/report", { state: { issueTitle: title } });
  };
  return (
    <section className="issues">
      <h2 className="issues-title">What's the issue?</h2>
      <div className="issues-container">
        {issues.map((item, index) => {
          if(index < IssCount){
          return (
            <div key={index} className="issue-card">
              <img src={item.image} alt={item.title} className="issue-image" />
              <h3 className="issue-title">{item.title}</h3>
              <p className="issue-description">{item.description}</p>
           <button
              className="issue-link"
              onClick={() => handleReportClick(item.title)}
            >
              Report Now →
            </button>
          </div>
          )}
          })}
      </div>

      <div className="see-more">
       <button className="btn-secondary" onClick={() =>{
        if(IssCount === 3){
          setIssCount(5)
        }
        if(IssCount === 5){
          setIssCount(3)
        }
       }}>
         { IssCount === 3 ? "See All Issue Categories" : "See Fewer Issue Categories" }
        </button>
      </div>
    </section>
  );
}
export default Issues;

