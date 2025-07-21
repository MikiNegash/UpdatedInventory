import React, { useEffect, useState } from 'react';
import SalesReport from './SalesReport'; // Make sure the path is correct

function SalesReportContainer() {
  const [sales, setLogs] = useState([]);        // where the logs are stored
  const [loading, setLoading] = useState(true); // loading status

  useEffect(() => {
    // Fetch data from API
    fetch('https://robo-rec.com/api/sales-report-details')  // 🔁 Replace with your real API
      .then(response => response.json())
      .then(data => {
        setLogs(data.data);    
        console.log('data222',data)  // store the logs
        setLoading(false);  // stop loading
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
        setLoading(false);
      });
  }, []); // Run once when the component loads

  if (loading) {
    return <p>Loading activity logs...</p>; // show this while fetching
  }
  console.log('Sales from API:', sales);

  return <SalesReport sales={sales} />; // pass logs to your component
}

export default SalesReportContainer;
