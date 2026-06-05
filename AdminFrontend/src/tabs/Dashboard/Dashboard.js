// src/components/Dashboard.js

import { API_BASE } from '../../config';
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import SummaryCard from './SummaryCards'; // Assuming you have a SummaryCard component
import ToDoList from './ToDoList';
import { BarChart, PieChart, pieArcLabelClasses, LineChart, ChartContainer, BarPlot } from '@mui/x-charts';

function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);
  const [jobsDone, setJobsDone] = useState(0);
  const [acceptedRequests, setAcceptedRequests] = useState(0);
  const [workerDist, setWorkerDist] = useState([]);
  const [history, setHistory] = useState([]);
  const [moneyCollected, setMoneyCollected] = useState([]);
  const [dateLabel, setDateLabel] = useState([]);
  const [satisfaction, setSatisfaction] = useState([]);
  const workerData = [
    { y: 100, label: "Electrician" },
  ];

  const getWorkerDistributionData = async () => {
    fetch(`${API_BASE}/admin/getworkerdistribution`)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        let electricians = 0;
        let plumbers = 0;
        let maids = 0;
        data.forEach(worker => {
          if (worker.occupation == 'Electrician') {
            electricians += 1;
          }
          if (worker.occupation == 'Plumber') {
            plumbers += 1;
          }
          if (worker.occupation == "Maid") {
            maids += 1;
          }
        })
        let tempArray = [electricians, plumbers, maids];
        setWorkerDist(tempArray);
      });
  }

  const fetchJobHistory = async () => {
    fetch(`${API_BASE}/admin/jobhistory`)
      .then(resp => resp.json())
      .then(data => {
        let electricians = 0;
        let plumbers = 0;
        let maids = 0;
        setHistory(data);
        setJobsDone(data.length);
        let SatisfactionArray = [];
        let DateArray = [];
        data.forEach(job => {
          SatisfactionArray.push(job.data.satisfaction);
          DateArray.push(job.data.date.slice(0, 9));
          if (job.data.ServiceWanted == "Electrician") {
            electricians += parseInt(job.data.payment);
          }
          if (job.data.ServiceWanted == "Plumber") {
            plumbers += parseInt(job.data.payment);
          }
          if (job.data.ServiceWanted == "Maid") {
            maids += parseInt(job.data.payment);
          }
        })
        let tempArray = [electricians, plumbers, maids];
        setMoneyCollected(tempArray);
        setSatisfaction(SatisfactionArray);
        setDateLabel(DateArray);
      })
  }

  useEffect(() => {
    // Fetch total users count
    fetch(`${API_BASE}/admin/countusers`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setTotalUsers(data);
      })
      .catch(error => console.error('Error fetching total users:', error));

    // Fetch accepted requests count
    fetch(`${API_BASE}/admin/countacceptedrequests`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setAcceptedRequests(data.totalAcceptedRequests);
      })
      .catch(error => console.error('Error fetching accepted requests:', error));

    // // Fetch workers data and count
    // fetch(`${API_BASE}/admin/workers`, { method: 'GET' })
    //   .then(response => response.json())
    //   .then(data => {
    //     setWorkerCount(data.count);
    //     const occupationData = data.workers.reduce((acc, worker) => {
    //       acc[worker.occupation] = (acc[worker.occupation] || 0) + 1;
    //       return acc;
    //     }, {});
    //     setWorkerOccupationData(occupationData);
    //   })
    //   .catch(error => console.error('Error fetching workers:', error));

    fetch(`${API_BASE}/admin/getworkers`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setWorkerCount(data.count);
        setCustomers(totalUsers - workerCount);
      })
      .catch(error => {
        console.error('Error fetching workers:', error);
      });
    getWorkerDistributionData();
    fetchJobHistory();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h3" gutterBottom>
        Dashboard
      </Typography>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap">
        <SummaryCard title="Total Users" value={totalUsers} />
        <SummaryCard title="Customers" value="3" /> {/* Placeholder for customers */}
        <SummaryCard title="Workers" value={workerCount} />
        <SummaryCard title="Jobs Done" value={jobsDone} />
      </Box>
      <Box mt={2}>
        <Typography variant="h5" gutterBottom>
          Worker Categories Percentage
        </Typography>
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.label} (${item.value})`,
              arcLabelMinAngle: 45,
              data: [
                { id: 0, value: workerDist[0], label: 'Electricians' },
                { id: 1, value: workerDist[1], label: 'Plumbers' },
                { id: 2, value: workerDist[2], label: 'Maids' },
              ],
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'black',
              fontWeight: 'bold',
            },
          }}
          width={400}
          height={200}
        />
      </Box>
      <Box mt={2}>
        <Typography>
          Satisfaction 
        </Typography>
        <LineChart
          xAxis={[{ scaleType: 'point', data: dateLabel, }]}
          series={[
            {
              data: satisfaction,
            },
          ]}
          width={900}
          height={500}
        />
      </Box>
      <Box mt={2}>
        <Typography variant="h5" gutterBottom>
          Money Earned 
        </Typography>
        <PieChart
        series={[
          {
            arcLabel: (item) => `${item.label} (${item.value})`,
            arcLabelMinAngle: 45,
            data: [
              { id: 0, value: moneyCollected[0], label: 'Electricians' },
              { id: 1, value: moneyCollected[1], label: 'Plumbers' },
              { id: 2, value: moneyCollected[2], label: 'Maids' },
            ],
          },
        ]}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: 'black',
            fontWeight: 'bold',
          },
        }}
        width={400}
        height={200}
      />
      </Box>
      
          <Box mt={2} bgcolor="white" p={2} borderRadius={8}>
        <Typography variant="h5" gutterBottom>
          To-Do List
        </Typography>
        <ToDoList />
      </Box>
    </Box>
        
  );
}
export default Dashboard;