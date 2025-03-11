import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import '../../Styling/DocumentManager.css'; // Import CSS for styling

const Payment = () => {
    const [addPopup, setAddPopup] = useState(false); 
    const [editPopup, setEditPopup] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false); 
    const [paymentToDelete, setPaymentToDelete] = useState(null); 
    
    const [existingPayments, setExistingPayments] = useState([]);
    const [balance, setBalance] = useState(0)

    const [paymentFields, setPaymentFields] = useState({
        
    });

    const [clientInfo, setClientInfo] = useState({
        email: 'abdullah@email.com',
        addresses: ['123 street', '456 court']
    });

    // get client's balance
    useEffect(() => {
        
        setBalance('20');
    }, []);
    // get exisiting payments
    useEffect(() => {
        // Generate dummy payments for testing
        fetch('/getpayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: clientInfo.email }),
        })
        .then(response => response.json())
        .then(data => {
            setExistingPayments(data.payments);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
    }, []);

    const handleEdit = (payment) => {
        // Load selected payment into the edit form fields
        setPaymentFields({ ...payment });
        setEditPopup(true);
    };

    const handleDelete = (payment) => {
        // Remove payment method from existingPayments array
        setPaymentToDelete(payment);
        setDeletePopup(true);
    };

    // set balance to 0
    const handlePayment = (payment) => {
        // Logic to process payment using the selected payment method
        setBalance('0')
        // Implement payment processing logic here
    };

    const handleAddSubmit = (e) => {
        const paymentInfo = {
            email: clientInfo.email,
            number: paymentFields.number,
            payAddress: paymentFields.payAddress
        }
        // send paymentInfo to be added
        fetch('/addpayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: paymentInfo }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    const handleEditSubmit = (e) => {
        e.preventDefault();
        // Perform operations like updating payments in backend/API
        console.log('Edited Payments:', existingPayments);
        const paymentToEdit = {
            email: clientInfo.email,
            number: paymentFields.number,
            payAddress: paymentFields.payAddress,
        };
        fetch('/editpayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: paymentToEdit }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
        setEditPopup(false);
    };

    const handleDeleteSubmit = () => {
        console.log('Delete client' , paymentToDelete);
        // call API to delete document
        const infoToDelete = {
            email: clientInfo.email,
            number: paymentToDelete.number,
            payAddress: paymentToDelete.payAddress,
        };
        fetch('/deletepayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: infoToDelete }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
        setDeletePopup(false);
      }

      const clearFields = () => {
        setPaymentFields({
            number: '', 
            payAddress: ''
        });
      }
    
      const handlePopupClose = () => {
        setEditPopup(false);
        setDeletePopup(false);
        setAddPopup(false);
        setPaymentToDelete(null);
        clearFields();
      }

    return (
        <>
            {/* Display client's current balance */}
            <div>
                <h3>Current Balance: ${balance}</h3>
            </div>
            {/* Button to open Add Card popup */}
            <button onClick={() => setAddPopup(true)}>Add Card</button>

            {/* Display existing payments */}
            <div className="existing-payments">
                <h3>Existing Payment Methods</h3>
                <ul>
                    {existingPayments.map((payment, index) => (
                        <li key={index}>
                            {payment.number} - Associated Address: {payment.payAddress}
                            <button onClick={() => handleEdit(payment)}>Edit</button>
                            <button onClick={() => handleDelete(payment)}>Delete</button>
                            <button onClick={() => handlePayment(payment)}>Pay</button>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Add Payment Popup */}
            {addPopup && (
                <Popup open={addPopup} closeOnDocumentClick={false}>
                    <div className="modal">
                        <button className="close" onClick={() => handlePopupClose()}>&times;</button>
                        <div className="client-manager-container">
                            <h1 className='form-header'>Add Card</h1>
                            <form onSubmit={handleAddSubmit} className="client-form">
                                {/* Render payment-specific fields */}
                                <div className="form-group">
                                    <label>Card Number:</label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={paymentFields.number}
                                        onChange={(e) => setPaymentFields({ ...paymentFields, number: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Payment Address:</label>
                                    <select
                                        name="payAddress"
                                        value={paymentFields.payAddress}
                                        onChange={(e) => setPaymentFields({ ...paymentFields, payAddress: e.target.value })}
                                    >
                                        {clientInfo.addresses.map((address, index) => (
                                            <option key={index} value={address}>{address}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Submit button */}
                                <button className="submit-button" type="submit">Add Card</button>
                            </form>
                        </div>
                    </div>
                </Popup>
            )}

            {/* Edit Payment Popup */}
            {editPopup && (
                <Popup open={editPopup} closeOnDocumentClick={false}>
                    <div className="modal">
                        <button className="close" onClick={() => handlePopupClose()}>&times;</button>
                        <div className="client-manager-container">
                            <h1 className='form-header'>Add Card</h1>
                            <form onSubmit={handleEditSubmit} className="client-form">
                                {/* Render payment-specific fields */}
                                <div className="form-group">
                                    <label>Card Number:</label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={paymentFields.number}
                                        onChange={(e) => setPaymentFields({ ...paymentFields, number: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Payment Address:</label>
                                    <select
                                        name="payAddress"
                                        value={paymentFields.payAddress}
                                        onChange={(e) => setPaymentFields({ ...paymentFields, payAddress: e.target.value })}
                                    >
                                        {clientInfo.addresses.map((address, index) => (
                                            <option key={index} value={address}>{address}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Submit button */}
                                <button className="submit-button" type="submit">Save Card</button>
                            </form>
                        </div>
                    </div>
                </Popup>
            )}

            {/* Delete Document Popup */}
            {deletePopup && (
                <Popup
                open={deletePopup}
                closeOnDocumentClick={false}
                >
                <div className="modal">
                    <button className="close" onClick={() => handlePopupClose()}>&times;</button>
                    <div className="client-manager-container">
                    <h1 className='form-header'>Are you sure you want to delete this payment?</h1>
                    
                    <button className="submit-button" type="submit" onClick={handleDeleteSubmit}>Confirm</button>
                    <button className="submit-button" type="submit" onClick={handlePopupClose}>Cancel</button>
                    
                    
                    </div>
                </div>
                </Popup>
            )}
        </>
    );
};

export default Payment;
