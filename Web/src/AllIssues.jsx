import { useNavigate } from "react-router-dom";
const allIssues = [
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

function AllIssues() {
   const navigate = useNavigate();

  const handleReportClick = (title) => {
    navigate("/report", { state: { issueTitle: title } });
  };
  return (
    <section className="issues">
      <h2 className="issues-title">All Issue Categories</h2>
      <div className=" issues-container">
        {allIssues.map((item, index) => (
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
    </section>
    
  );
}

export default AllIssues;
