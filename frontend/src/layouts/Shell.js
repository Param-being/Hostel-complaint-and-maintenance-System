import { Link } from "react-router-dom";

function Shell({ children }) {
  return (
    <div style={{ display: "flex" }}>
      
      {/* Sidebar */}
      <div style={{
        width: "200px",
        background: "#222",
        color: "white",
        height: "100vh",
        padding: "20px"
      }}>
        <h3>HostelCare</h3>

        <Link to="/student" style={{ color: "white", display: "block", margin: "10px 0" }}>
          Student
        </Link>

        <Link to="/admin" style={{ color: "white", display: "block", margin: "10px 0" }}>
          Admin
        </Link>

        <Link to="/worker" style={{ color: "white", display: "block", margin: "10px 0" }}>
          Worker
        </Link>

        <Link to="/admin-sos" style={{ color: "white", display: "block", margin: "10px 0" }}>
          SOS Dashboard
        </Link>

      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>

    </div>
  );
}

export default Shell;