 function Explore() {
  return (
    <div className="page explore">
      <h1>🔍 Explore Reported Issues</h1>
      <p>
        Browse issues reported by other citizens. This helps identify the most
        common problems in your area and allows community-driven support.
      </p>

      <ul className="issue-list">
        <li>
          🚧 <strong>Potholes on Sector 12 Road</strong> <br />
          Multiple potholes making driving unsafe.
        </li>
        <li>
          💡 <strong>Street Light not working</strong> <br />
          Entire park area remains dark after 7 PM.
        </li>
        <li>
          🗑 <strong>Garbage collection delayed in Block C</strong> <br />
          Waste not picked up for 3 days, foul smell spreading.
        </li>
        <li>
          💧 <strong>Water leakage near Bus Stand</strong> <br />
          Continuous water leak wasting thousands of liters.
        </li>
      </ul>
    </div>
  );
}
export default Explore;
