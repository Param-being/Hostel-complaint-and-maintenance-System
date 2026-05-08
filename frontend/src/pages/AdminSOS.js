import { useEffect, useState } from "react";
import axios from "axios";
import Shell from "../layouts/Shell";

function AdminSOS() {
  const [sosList, setSosList] = useState([]);

  const token = localStorage.getItem("token");

  const fetchSOS = async () => {
    try {
      const res = await axios.get(
        "http://192.168.0.108:5000/api/sos",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSosList(res.data.sosList);

    } catch (error) {
      alert("Error fetching SOS");
    }
  };

  useEffect(() => {
    fetchSOS();
  }, []);

  const resolveSOS = async (id) => {
    try {
      await axios.put(
        `http://192.168.0.108:5000/api/sos/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("SOS Resolved");
      fetchSOS();

    } catch (error) {
      alert("Error resolving SOS");
    }
  };

  return (
    <Shell>
      <h2>SOS Dashboard</h2>

      {sosList.map((sos) => (
        <div key={sos._id}>
          <p>User: {sos.user?.email}</p>
          <p>Status: {sos.status}</p>

          {sos.status === "active" && (
            <button onClick={() => resolveSOS(sos._id)}>
              Resolve
            </button>
          )}

          <hr />
        </div>
      ))}
    </Shell>
  );
}

export default AdminSOS;