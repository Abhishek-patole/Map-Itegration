import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <Link to="/" style={{ marginRight: "20px", color: "#fff", textDecoration: "none" }}>Home</Link>
      <Link to="/rides" style={{ marginRight: "20px", color: "#fff", textDecoration: "none" }}>Available Rides</Link>
      <Link to="/create-ride" style={{ color: "#fff", textDecoration: "none" }}>Create Ride</Link>
    </nav>
  );
};

export default Navbar;
