import { API_BASE } from '../../config';
import '../../components/components.css'
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';

function UserDetails() {
    const { uid } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [banned, setBanned] = useState();
    console.log(uid);
    const fetchUser = async () => {
        console.log("User Id is", uid)
        fetch(`${API_BASE}/admin/user/${uid}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setUser(data);
                if (data.ban) {
                    setBanned("True")
                } else {
                    setBanned("False")
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                setLoading(false);
            });
    }
    useEffect(() => {
        fetchUser();
    }, [uid]);

    if (loading) {
        return <CircularProgress />;
    }

    const handleApproveWorker = async () => {
        setLoading(true);
        fetch(`${API_BASE}/admin/approveworker/${uid}`, { method: 'GET' })
            .then(resp => {
                alert('Worker Approved');
                fetchUser();
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching workers:', error);
                setLoading(false);
            });
    }

    const banuser = async () => {
        setLoading(true);
        fetch(`${API_BASE}/admin/banuser/${uid}`, { method: 'GET' })
        .then(response =>{
            alert("user unbanned");
            fetchUser();
        }).catch(error => {
            console.error('Error fetching user details:', error);
            setLoading(false);
        });
    }

    const unbanuser = async ()=>{
        setLoading(true);
        fetch(`${API_BASE}/admin/unbanuser/${uid}`, { method: 'GET' })
        .then(response =>{
            alert("user unbanned");
            fetchUser();
        }).catch(error => {
            console.error('Error fetching user details:', error);
            setLoading(false);
        });
    }

    return (
        <Box component={Paper} p={3}>
            <Typography variant="h4" gutterBottom>
                Worker
            </Typography>
            {user ? (
                <>
                    <div className='row'>
                        <img src={user.photoURL} className='image' alt="user image" />
                        <div className='user-typography'>
                            <Typography>
                                User Name : {user.username || user.name}
                            </Typography>
                            {user.locationName ?
                                (<>
                                    <Typography>
                                        Home : {user.locationName}
                                    </Typography>
                                </>) : (<>
                                    <Typography>
                                        Occupation : {user.occupation}
                                    </Typography>
                                </>)}
                            <Typography>
                                Phone : {user.phone_number || user.phoneNumber}
                            </Typography>
                            <Typography>
                                Banned : {banned}
                            </Typography>
                        </div>
                        <img className="id-image" alt='ID' src={user.idURL}/>
                    </div>  
                    {user.approved ?
                        (<div>
                            {user.ban ?
                                (<div>
                                    <Button onClick={()=> unbanuser()}> Remove Ban </Button>
                                </div>) :
                                (<div>
                                    <a href={user.certificateURL} > View Ceritificate </a>
                                    <Button onClick={() => banuser()}> Ban Worker </Button>
                                </div>)}

                        </div>) :
                        (<div>
                            <Button > Email Institution </Button>
                            <a href={user.certificateURL} > View Ceritificate </a>
                            <Button onClick={() => handleApproveWorker()}> Approve Worker </Button>
                        </div>)}


                </>
            ) : (
                <Typography variant="body1">User not found.</Typography>
            )}
        </Box>
    );
}

export default UserDetails;
