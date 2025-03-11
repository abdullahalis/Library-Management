import React, { useState, useEffect} from 'react';
import axios from 'axios';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const ClientManager = () => {
    // States to control popup visibility
  const [addPopup, setAddPopup] = useState(false); 
  const [deletePopup, setDeletePopup] = useState(false); 
  const [editPopup, setEditPopup] = useState(false); 
  const [clientToDelete, setClientToDelete] = useState(null); 

  
  // Define state to hold client fields
  const [clientFields, setClientFields] = useState({
    name: '',
    email: '',
    addresses: [''],
    creditCards: [{ number: '', payAddress: '' }]
  });

  const [existingClients, setExistingClients] = useState([]);

  useEffect(() => {
    fetch("/clients")
            .then(res => res.json())
            .then(existingClients => {
                console.log(existingClients.clients);
                setExistingClients(existingClients.clients);
            });
  }, []);
  // useEffect(() => {
  //   // Generate dummy documents for testing
  //   const dummyClients = [
  //     {
  //       name: 'John Doe',
  //       email: 'johndoe@gmail.com',
  //       addresses: ['123 Sesame Street', '321 63rd Street'],
  //       creditCards: [{number: '1234 6789 1011', payAddress: '123 Sesame Street'}]
  //     },
  //     {
  //       name: 'Lebron James',
  //       email: 'lebron@gmail.com',
  //       addresses: ['123 Sesame Street'],
  //       creditCards: [{number: '1234 6789 1011', payAddress: '123 Sesame Street'}]
  //     },
  //     {
  //       name: 'Mike Wazowski',
  //       email: 'mike@gmail.com',
  //       addresses: ['123 Sesame Street', '321 63rd Street'],
  //       creditCards: [{number: '1234 6789 1011', payAddress: '123 Sesame Street'}]
  //     }
  //   ];
  //   console.log(dummyClients);
  //   setExistingClients(dummyClients);
  // }, []);

  // use this to get documents from DB

  // useEffect(() => {
  //   // Fetch existing documents from API or mock data
  //   fetchExistingDocuments();
  // }, []);

  // const fetchExistingDocuments = async () => {
  //   try {
  //     const response = await axios.get('http://your-api-url/documents');
  //     setExistingDocuments(response.data); // Assuming API returns an array of documents
  //   } catch (error) {
  //     console.error('Error fetching existing documents:', error);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientFields({ ...clientFields, [name]: value });
  };

  const handleAddAddress = () => {
    setClientFields({ ...clientFields, addresses: [...clientFields.addresses, ''] });
  };

  const handleAddCreditCard = () => {
    const newCreditCard = { number: '', addressIndex: 0 };
    setClientFields({ ...clientFields, creditCards: [...clientFields.creditCards, newCreditCard] });
  };

  const handleDeleteAddress = (index) => {
    if (clientFields.addresses.length > 1) {
      const updatedAddresses = [...clientFields.addresses];
      updatedAddresses.splice(index, 1);
      setClientFields({ ...clientFields, addresses: updatedAddresses });
    }
  };

  const handleDeleteCreditCard = (index) => {
    if (clientFields.creditCards.length > 1) {
      const updatedCreditCards = [...clientFields.creditCards];
      updatedCreditCards.splice(index, 1);
      setClientFields({ ...clientFields, creditCards: updatedCreditCards });
    }
  };

  const handleCreditCardChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCreditCards = [...clientFields.creditCards];
    updatedCreditCards[index][name] = value;
    setClientFields({ ...clientFields, creditCards: updatedCreditCards });
  };

  const loadClientDetails = (client) => {
    
    return (
      <>
        <div className="grid-item">Name: {client.name}</div>
        <div className="grid-item">Email Address: {client.email}</div>
        <div className="grid-item">
          Addresses:
          {client.addresses.map((address, index) => (
            <span key={index}>
              {address}
              {index !== client.addresses.length - 1 && ', '}
            </span>
          ))}
        </div>
        <div className="grid-item">
          Credit Cards:
          <ul>
            {client.creditCards.map((card, index) => (
              <li key={index}>
                {card.number} - Associated Address: {card.payAddress}
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  const handleAdd = () => {
    setAddPopup(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const clientInfo = {
        name: clientFields.name,
        email: clientFields.email,
        addresses: clientFields.addresses,
        ccard: clientFields.creditCards
    };

    fetch('/addclient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: clientInfo }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response if needed
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // Perform operations like inserting/updating documents based on documentType and documentFields
    //console.log('Submitted:', clientFields);
    // Add logic to interact with your backend/API for database operations
  };

  const handleEdit = (client) => {
    setClientFields({
      ...client
    });
    setEditPopup(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Perform operations like inserting/updating documents based on documentType and documentFields
    console.log('Edited:', clientFields);
    // Add logic to interact with your backend/API for database operations
    const clientInfo = {
      name: clientFields.name,
      email: clientFields.email,
      addresses: clientFields.addresses,
      ccard: clientFields.creditCards
  };
  fetch('/editclient', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: clientInfo }),
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response if needed
  })
  .catch(error => {
      console.error('Error:', error);
  });
    // Close the edit popup after submission
    setEditPopup(false);
  };

  const handleDelete = (client) => {
    setClientToDelete(client);
    setDeletePopup(true);
  };

  
  const handleDeleteSubmit = () => {
    console.log('Delete client' , clientToDelete);
    // call API to delete document
    fetch('/deleteclient', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: clientToDelete.email }),
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


  const renderClientItems = () => {
    return existingClients.map((client) => (
      <div key={client.email} className="client-item">
        <h4>{client.name}</h4>
        <div className="client-details">
          {loadClientDetails(client)}
        </div>
        <div className="action-buttons">
          <button onClick={() => handleEdit(client)}>Edit</button>
          <button onClick={() => handleDelete(client)}>Delete</button>
        </div>
      </div>
    ));
  };
  
  const renderFields = () => {
    return (
        <>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={clientFields.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address:</label>
            <input
              type="text"
              name="email"
              value={clientFields.email}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Render multiple address input fields */}
          {clientFields.addresses.map((address, index) => (
            <div className="form-group" key={`address-${index}`}>
              <label>Address {index + 1}:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  const updatedAddresses = [...clientFields.addresses];
                  updatedAddresses[index] = e.target.value;
                  setClientFields({ ...clientFields, addresses: updatedAddresses });
                }}
                required
              />
              {/* Button to delete the latest added address */}
              {clientFields.addresses.length > 1 && (
                <button className='delete-button' type="button" onClick={() => handleDeleteAddress(index)}>Delete</button>
              )}
              
            </div>
          ))}
          <div className='form-group'>
            {/* Button to add additional address field */}
            <button className='add-button' type="button" onClick={handleAddAddress}>Add Another Address</button>
          </div>
          

          {/* Render multiple credit card input fields */}
          {clientFields.creditCards.map((creditCard, index) => (
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
                {clientFields.addresses.map((address) => (
                  <option key={address} value={address}>{address}</option>
                ))}
              </select>
              {/* Button to delete the latest added credit card */}
              {clientFields.creditCards.length > 1 && (
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
  }

  const clearFields = () => {
    setClientFields({
        name: '',
        addresses: [''],
        creditCards: [{ number: '', payAddress: '' }]
    });
  }

  const handlePopupClose = () => {
    setEditPopup(false);
    setDeletePopup(false);
    setAddPopup(false);
    setClientToDelete(null);
    clearFields();
  }

  return (
    <>
      <div className='add-client-button-container'>
        <button className='add-client-button' onClick={handleAdd}>Add Client</button>
      </div>
      
      
      {/* Display existing documents in a table */}
      <div className="existing-documents">
        <h3>Existing Clients</h3>
        <div className="document-grid">
        {renderClientItems()}
        </div>
      </div>
      
      {addPopup && (
        <Popup
          open={addPopup}
          closeOnDocumentClick={false}
        >
          <div className="modal">
          <button className="close" onClick={() => handlePopupClose()}>&times;</button>
            <div className="client-manager-container">
              <h1 className='form-header'>Add New Client</h1>
              <form onSubmit={handleAddSubmit} className="client-form">
                
                {/* Render document-specific fields based on selected type */}
                <div className="type-specific-fields">
                  {renderFields()}
                </div>
                {/* Submit button */}
                <button className= "submit-button" type="submit" onClick={handleAddSubmit}>Submit</button>
              </form>
            </div>
          </div>
        </Popup>
      )}

      {/* Edit Document Popup */}
      {editPopup && (
        <Popup
          open={editPopup}
          closeOnDocumentClick={false}
        >
          <div className="modal">
            <button className="close" onClick={() => handlePopupClose()}>&times;</button>
            <div className="client-manager-container">
              <h1 className='form-header'>Edit Document</h1>
              <form onSubmit={handleEditSubmit} className="client-form">
                {/* Render document-specific fields based on selected type */}
                
                {renderFields()}
                
                {/* Submit button */}
                <button className="submit-button" type="submit" onClick={handleEditSubmit}>Save Changes</button>
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
              <h1 className='form-header'>Are you sure you want to delete this client?</h1>
              
              <button className="submit-button" type="submit" onClick={handleDeleteSubmit}>Confirm</button>
              <button className="submit-button" type="submit" onClick={handlePopupClose}>Cancel</button>
              
              
            </div>
          </div>
        </Popup>
      )}
    </>
    
  );
}

export default ClientManager;