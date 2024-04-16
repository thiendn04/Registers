import axios from 'axios';
import React, { useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    })
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://192.168.225.110:8081') //IP Web1, có thể để hostname nếu có dns
        .then( res => {
            if(res.data.Status === "Success") {
                navigate('/home')
            } else {
                navigate('/')
            }
        })
        .catch(err => console.log(err));
    }, [navigate])
    const handleSubmit =(event) => {
        event.preventDefault();
        axios.post('http://192.168.225.110:8081/login', values) //IP Web1, có thể để hostname nếu có dns
        .then(res => {
            if(res.data.Status === "Success") {
                navigate('/home');
            } else {
                alert("No record existed");
            }
        })
        .then(err => console.log(err));
    }
  return (
    <div className='d-flex justify-content-center align-items-center bg-primary vh-100'>
        <div className='bg-white p-3 rounded w-25 border'>
            <h2>Sign-In</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="email"><strong>Email:</strong></label>
                    <input type="email" placeholder='Enter Email' name='email'
                    onChange={e => setValues({...values, email: e.target.value})} className='form-control rounded-0'/>
                </div>
                <div className='mb-3'>
                    <label htmlFor="password"><strong>Password:</strong></label>
                    <input type="password" placeholder='Enter Password' name='password'
                    onChange={e => setValues({...values, password: e.target.value})} className='form-control rounded-0'/>
                </div>
                <button type='submit' className='btn btn-success w-100 rounded-0'> Log in</button>
                <p>You are agree to a our terms and policies</p>
                <Link to="/signup" className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Create Account</Link>
            </form>
        </div>
    </div>
  )
}
export default Login