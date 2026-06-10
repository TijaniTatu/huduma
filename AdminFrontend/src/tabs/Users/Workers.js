
import { API_BASE } from '../../config';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

function WorkersList() {
  const [workers, setWorkers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unapproved, setUnapproved] = useState([]);
  const [unapprovedCount, setUnapprovedCount] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    fetch(`${API_BASE}/admin/getworkers`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setWorkers(data.workers);
        setCount(data.count);
        setLoading(false);
        fetch(`${API_BASE}/admin/awaitingapproval`, { method: 'GET' })
          .then(response => response.json())
          .then(Data => {
            console.log(Data);
            setUnapproved(Data.workers);
            setUnapprovedCount(Data.count);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching workers:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching workers:', error);
        setLoading(false);
      });

  }

  const handleBanUser = async (uid) => {
    setLoading(true);
    fetch(`${API_BASE}/admin/banuser/${uid}`, { method: 'GET' })
      .then(resp => {
        alert('User Banned');
        fetchUser();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching workers:', error);
        setLoading(false);
      });
  }

  const handleDeleteUser = async (uid) => {
    setLoading(true);
    fetch(`${API_BASE}/admin/deleteuser/${uid}`, { method: 'GET' })
      .then(resp => {
        alert('Worker Deleted');
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching workers:', error);
        setLoading(false);
      });
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Workers
      </Typography>
      <Typography variant="h6" gutterBottom>
        Total Workers: {count}
      </Typography>
      <TableContainer component={Paper}>
        {loading ?
          (<React.Fragment>
            <CircularProgress />
          </React.Fragment>) :
          (<React.Fragment>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell> Name </TableCell>
                  <TableCell> Occupation </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <Link to={`/viewworker/${user.uid}`}>
                        {user.uid}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {user.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {user.occupation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleBanUser(user.uid)} aria-label="ban">
                        <BlockIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUser(user.uid)} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </React.Fragment>)}
      </TableContainer>
      <Box>

      </Box>
      <Typography variant="h4" gutterBottom>
        Awaiting Approval
      </Typography>
      <TableContainer component={Paper}>
        {loading ?
          (<React.Fragment>
            <CircularProgress />
          </React.Fragment>) :
          (<React.Fragment>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell> Name </TableCell>
                  <TableCell> Occupation </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unapproved.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <Link to={`/viewworker/${user.uid}`}>
                        {user.uid}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {user.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {user.occupation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleBanUser(user.uid)} aria-label="ban">
                        <ThumbUpIcon/>
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUser(user.uid)} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </React.Fragment>)}
      </TableContainer>
    </Box>
  );
}

export default WorkersList;
