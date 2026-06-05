import { API_BASE } from '../config';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, CircularProgress, Tab } from '@mui/material';
import { Link } from 'react-router-dom';
import '../components/components.css'

export default function JobsHistory() {

    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/admin/jobhistory`)
            .then(resp => resp.json())
            .then(data => {
                setData(data);
                setLoading(false)
                console.log(data);
            })
    }, [])

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                History
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
                                    <TableCell>Requested By </TableCell>
                                    <TableCell>Accepted By</TableCell>
                                    <TableCell>Location Name </TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Pay</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((job, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Link to={`/users/${job.data.uid}`}>
                                                {job.data.uid}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                        <Link to={`/users/${job.data.acceptedBy}`}>
                                                {job.data.acceptedBy}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {job.data.locationName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {job.data.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {job.data.payment}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </React.Fragment>)}
            </TableContainer>
        </Box>
    )
}
