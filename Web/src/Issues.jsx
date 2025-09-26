import { useNavigate } from "react-router-dom";
const issues = [
  {
    title: "Malfunctioning Street Lights",
    description: "Report Street lights that are out of order, blinking, or timed incorrectly.",
    image: "/images/street light.jpg"
  },
  {
    title: "Potholes",
    description: "Alert the city to dangerous potholes on roads, bike lanes, and sidewalks.",
    image: "/images/pathholes.jpg"
  },
  {
    title: "Overflowing Dustbins",
    description: "Report public trash cans that are full and need to be emptied.",
    image: "/images/dustbin.jpg"
  }
];

 function Issues() {
    const navigate = useNavigate();

  const handleReportClick = (title) => {
    navigate("/report", { state: { issueTitle: title } });
  };
  return (
    <section className="issues">
      <h2 className="issues-title">What's the issue?</h2>
      <div className="issues-container">
        {issues.map((item, index) => (
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
        ))}
      </div>

      <div className="see-more">
       <button className="btn-secondary" onClick={() =>{navigate("/all-issues");}}>
          See All Issue Categories
        </button>
      </div>
    </section>
  );
}
export default Issues;

