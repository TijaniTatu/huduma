import { API_BASE } from '../config';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, CircularProgress, Tab } from '@mui/material';
import { Link } from 'react-router-dom';
import '../components/components.css'
export default function Complaints() {

    const [complaints, setComplains] = useState();
    const [clientId, setClientId] = useState('');
    const [workerId, setWorkerId] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/admin/complaints`)
            .then(resp => resp.json())
            .then(data => {
                setComplains(data);
                setLoading(false)
                console.log(data);
            })
    }, [])

    const clearComplaint = async (complaint_id) => {
        fetch(`${API_BASE}/admin/clearcomplaint/${complaint_id}`)
            .then(()=>{
                fetch(`${API_BASE}/admin/complaints`)
                .then(resp => resp.json())
                .then(data => {
                    setComplains(data);
                    setLoading(false)
                    console.log(data);
                })
            })
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Complaints
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
                                    <TableCell>Worker </TableCell>
                                    <TableCell>Complaint </TableCell>
                                    <TableCell> Clear Complaints </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {complaints.map((job, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Link to={`/users/${job.id.split("::")[1]}`}>
                                                {job.id.split("::")[1]}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/users/${job.id.split("::")[0]}`}>
                                                {job.id.split("::")[0]}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {job.data.complaint}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button> 
                                                Clear
                                            </Button>
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
