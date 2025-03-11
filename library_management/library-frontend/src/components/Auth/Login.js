import React, { useState } from 'react';
import axios from 'axios';
import '../../Styling/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://your-api-url/login', formData);
      console.log(response.data); // Handle successful login (e.g., store JWT)
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className='login-container'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className='login-form'>
        <div className='form-group'>
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>
        <div className='form-group'>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
