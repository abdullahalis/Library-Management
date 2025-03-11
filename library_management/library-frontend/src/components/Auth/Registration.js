import React, { useState } from 'react';
import axios from 'axios';
import '../../Styling/Registration.css'; // Import CSS file for styling

const Registration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client', // Default role is 'client'
    name: '',
    addresses: [''],
    creditCards: [{ number: '', payAddress: ''}], // Each credit card has a number and is associated with an address index
    ssn: '',
    salary: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddAddress = () => {
    setFormData({ ...formData, addresses: [...formData.addresses, ''] });
  };

  const handleAddCreditCard = () => {
    const newCreditCard = { number: '', payAddress: formData.addresses[0] };
    setFormData({ ...formData, creditCards: [...formData.creditCards, newCreditCard] });
  };

  const handleDeleteAddress = (index) => {
    if (formData.addresses.length > 1) {
      const updatedAddresses = [...formData.addresses];
      updatedAddresses.splice(index, 1);
      setFormData({ ...formData, addresses: updatedAddresses });
    }
  };

  const handleDeleteCreditCard = (index) => {
    if (formData.creditCards.length > 1) {
      const updatedCreditCards = [...formData.creditCards];
      updatedCreditCards.splice(index, 1);
      setFormData({ ...formData, creditCards: updatedCreditCards });
    }
  };

  const handleCreditCardChange = (index, e) => {
    const { name, value } = e.target;
    console.log("name", name);
    console.log("value", value);
    const updatedCreditCards = [...formData.creditCards];
    updatedCreditCards[index][name] = value;
    console.log("updated cards", updatedCreditCards);
    setFormData({ ...formData, creditCards: updatedCreditCards });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    // try {
    //   const response = await axios.post('http://your-api-url/register', formData);
    //   console.log(response.data); // Handle successful registration
    // } catch (error) {
    //   console.error('Registration failed:', error);
    // }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === 'client') {
      return (
        <>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Render multiple address input fields */}
          {formData.addresses.map((address, index) => (
            <div className="form-group" key={`address-${index}`}>
              <label>Address {index + 1}:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  const updatedAddresses = [...formData.addresses];
                  updatedAddresses[index] = e.target.value;
                  setFormData({ ...formData, addresses: updatedAddresses });
                }}
                required
              />
              {/* Button to delete the latest added address */}
              {formData.addresses.length > 1 && (
                <button className='delete-button' type="button" onClick={() => handleDeleteAddress(index)}>Delete</button>
              )}
              
            </div>
          ))}
          <div className='form-group'>
            {/* Button to add additional address field */}
            <button className='add-button' type="button" onClick={handleAddAddress}>Add Another Address</button>
          </div>
          

          {/* Render multiple credit card input fields */}
          {formData.creditCards.map((creditCard, index) => (
            <div className="form-group" key={`credit-card-${index}`}>
              <label className='credit-payment'>Credit Card Number:</label>
              <input
                type="text"
                name="number"
                value={creditCard.number}
                onChange={(e) => handleCreditCardChange(index, e)}
                required
              />
              <label className='credit-payment'>Payment Address:</label>
              {/* Select dropdown to choose address for the credit card */}
              <select
                name="payAddress"
                value={creditCard.payAddress}
                onChange={(e) => handleCreditCardChange(index, e)}
              >
                <option></option>
                {formData.addresses.map((address) => (
                  <option key={address} value={address}>{address}</option>
                ))}
              </select>
              {/* Button to delete the latest added credit card */}
              {formData.creditCards.length > 1 && (
                <button className = "delete-button" type="button" onClick={() => handleDeleteCreditCard(index)}>Delete</button>
              )}
            </div>
          ))}
          <div className='form-group'>
            {/* Button to add additional credit card field */}
            <button className='add-button' type="button" onClick={handleAddCreditCard}>Add Another Credit Card</button>
          </div>
        </>
      );
    } else if (formData.role === 'librarian') {
      return (
        <>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>SSN (Social Security Number):</label>
            <input
              type="text"
              name="ssn"
              value={formData.ssn}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Salary:</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="registration-container">
      <h2>Registration</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label className="label-container">Role:</label>
          <select name="role" value={formData.role} onChange={handleInputChange}>
            <option value="client">Client</option>
            <option value="librarian">Librarian</option>
          </select>
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        {/* Render role-specific fields based on selected role */}
        <div className="role-specific-fields">
          {renderRoleSpecificFields()}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Registration;
