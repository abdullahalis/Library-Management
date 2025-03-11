import React, { useState, useEffect} from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import '../../Styling/DocumentManager.css'; // Import CSS for styling

const DocumentManager = () => {
  // States to control popup visibility
  const [addDocPopup, setAddDocPopup] = useState(false); 
  const [deleteDocPopup, setDeleteDocPopup] = useState(false); 
  const [editDocPopup, setEditDocPopup] = useState(false); 
  const [docToDelete, setDocToDelete] = useState(null); 

  
  // Define state to hold document fields
  const [documentFields, setDocumentFields] = useState({
    type: 'book', // default doc type is book

    // book fields
    title: '',
    authors: [''],
    isbn: '',
    publisher: '',
    year: '',
    edition: '',
    numPages: '',

    // extra magazine fields
    name: '',
    month: '',

    // extra journal fields
    issue: '',
    number: '',
  });

  const [existingDocuments, setExistingDocuments] = useState([]);

  useEffect(() => {
    // Generate dummy documents for testing
    fetch("/getbooks")
            .then(res => res.json())
            .then(existingDocuments => {
                console.log(existingDocuments.docs);

                setExistingDocuments(existingDocuments.docs);
            });
  }, []);

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
    setDocumentFields({ ...documentFields, [name]: value });
  };

  const loadDocumentDetails = (document) => {
    switch (document.type) {
      case 'book':
        return (
          <>
            <div className="grid-item">Authors: {document.authors.join(', ')}</div>
            <div className="grid-item">Publisher: {document.publisher}</div>
            <div className="grid-item">Year: {document.year}</div>
            <div className="grid-item">Edition: {document.edition}</div>
            {/* <div className="grid-item">Number of Pages: {document.numPages}</div> */}
            <div className="grid-item">ISBN: {document.isbn}</div>
          </>
        );
      case 'magazine':
        return (
          <>
            <div className="grid-item">Publisher: {document.publisher}</div>
            <div className="grid-item">Year: {document.year}</div>
            <div className="grid-item">Month: {document.month}</div>
            <div className="grid-item">Name: {document.name}</div>
          </>
        );
      case 'article':
        return (
          <>
            <div className="grid-item">Authors: {document.authors.join(', ')}</div>
            <div className="grid-item">Publisher: {document.publisher}</div>
            <div className="grid-item">Year: {document.year}</div>
            <div className="grid-item">Issue: {document.issue}</div>
            <div className="grid-item">Number: {document.number}</div>
          </>
        );
      default:
        return null;
    }
  };

  const handleAddAuthorField = () => {
    const updatedAuthors = [...documentFields.authors, ''];
    setDocumentFields({ ...documentFields, authors: updatedAuthors });
  };

  const handleRemoveAuthorField = (index) => {
    if (documentFields.authors.length > 1) {
      const updatedAuthors = [...documentFields.authors];
      updatedAuthors.splice(index, 1);
      setDocumentFields({ ...documentFields, authors: updatedAuthors });
    }
  };

  const handleAdd = () => {
    setAddDocPopup(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    // Perform operations like inserting/updating documents based on documentType and documentFields
    console.log('Submitted:', documentFields);
    // Add logic to interact with your backend/API for database operations
    fetch('/adddoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: documentFields }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        // Optionally, update state or trigger any other actions after successful document addition
      })
      .catch(error => {
        console.error('Error adding document:', error);
      });
  };

  const handleEdit = (document) => {
    // Set the documentFields state with the current document's details
    // let authorString = '';
    // console.log(document.authors);
    // if (typeof document.authors !== 'undefined') {
    //   authorString = document.authors.toString();
    // }
    setDocumentFields({
      ...document,
       // Convert authors array to string for editing
    });
    setEditDocPopup(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Perform operations like inserting/updating documents based on documentType and documentFields
    console.log('Edited:', documentFields);
    // Add logic to interact with your backend/API for database operations
    fetch('/editdoc', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: documentFields }),
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response if needed
  })
  .catch(error => {
      console.error('Error:', error);
  });
    // Close the edit popup after submission
    setEditDocPopup(false);
  };

  const handleDelete = (document) => {
    setDocToDelete(document);
    setDeleteDocPopup(true);
  };

  
  const handleDeleteSubmit = () => {
    console.log('Delete document' , docToDelete);
    // call API to delete document
    fetch('/deletedoc', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: docToDelete }),
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response if needed
  })
  .catch(error => {
      console.error('Error:', error);
  });
    setDeleteDocPopup(false);
  }

  
  const renderAuthorFields = () => {
    return documentFields.authors.map((author, index) => (
      <div key={`author-${index}`} className="form-group">
        <label>{`Author ${index + 1}:`}</label>
        <input
          type="text"
          value={author}
          onChange={(e) => {
            const updatedAuthors = [...documentFields.authors];
            updatedAuthors[index] = e.target.value;
            setDocumentFields({ ...documentFields, authors: updatedAuthors });
          }}
          required
        />
        {/* Show remove button only if there is more than one author */}
        {documentFields.authors.length > 1 && (
          <button className='delete-button' type="button" onClick={() => handleRemoveAuthorField(index)}>
            Remove
          </button>
        )}
      </div>
    ));
  };

  const renderDocumentSpecificFields = () => {
    if (documentFields.type === 'book') {
      return (
        <>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={documentFields.title}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Render author fields */}
          {renderAuthorFields()}
          {/* Button to add new author field */}
          <div className="form-group">
            <button className='add-button' type="button" onClick={handleAddAuthorField}>
              Add Author
            </button>
          </div>
          <div className="form-group">
            <label>ISBN:</label>
            <input
              type="text"
              name="isbn"
              value={documentFields.isbn}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Publisher:</label>
            <input
              type="text"
              name="publisher"
              value={documentFields.publisher}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Edition:</label>
            <input
              type="text"
              name="edition"
              value={documentFields.edition}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Year:</label>
            <input
              type="text"
              name="year"
              value={documentFields.year}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Pages:</label>
            <input
              type="text"
              name="numPages"
              value={documentFields.numPages}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      );
    } 
    
    else if (documentFields.type === 'magazine') {
      return (
        <>
          <div className="form-group">
            <label>Magazine Name:</label>
            <input
              type="text"
              name="name"
              value={documentFields.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>ISBN:</label>
            <input
              type="text"
              name="isbn"
              value={documentFields.isbn}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Publisher:</label>
            <input
              type="text"
              name="publisher"
              value={documentFields.publisher}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Year:</label>
            <input
              type="text"
              name="year"
              value={documentFields.year}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Month:</label>
            <input
              type="text"
              name="month"
              value={documentFields.month}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      );
    }

    else if (documentFields.type === 'article') {
      return (
        <>
          <div className="form-group">
            <label>Journal Name:</label>
            <input
              type="text"
              name="name"
              value={documentFields.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={documentFields.title}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Render author fields */}
          {renderAuthorFields()}
          {/* Button to add new author field */}
          <button type="button" onClick={handleAddAuthorField}>
            Add Author
          </button>
          <div className="form-group">
            <label>Publisher:</label>
            <input
              type="text"
              name="publisher"
              value={documentFields.publisher}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Year:</label>
            <input
              type="text"
              name="year"
              value={documentFields.year}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Issue:</label>
            <input
              type="text"
              name="issue"
              value={documentFields.issue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Number:</label>
            <input
              type="text"
              name="number"
              value={documentFields.number}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      );
    }
  };

  const renderDocumentItems = () => {
    return existingDocuments.map((document) => (
      <div key={document.id} className="document-item">
        <h4>{document.title || document.name}</h4>
        <div className="document-details">
          {loadDocumentDetails(document)}
        </div>
        <div className="action-buttons">
          <button onClick={() => handleEdit(document)}>Edit</button>
          <button onClick={() => handleDelete(document)}>Delete</button>
        </div>
      </div>
    ));
  };

  const clearDocFields = () => {
    setDocumentFields({
      type: 'book', // Set type back to 'book'
      title: '',
      authors: [''],
      isbn: '',
      publisher: '',
      year: '',
      edition: '',
      numPages: '',
      name: '',
      month: '',
      issue: '',
      number: ''
    });
  }

  const handlePopupClose = () => {
    setEditDocPopup(false);
    setDeleteDocPopup(false);
    setAddDocPopup(false);
    setDocToDelete(null);
    clearDocFields();
  }

  return (
    <>
      <div className='add-doc-button-container'>
        <button className='add-doc-button' onClick={handleAdd}>Add Doc</button>
      </div>
      
      
      {/* Display existing documents in a table */}
      <div className="existing-documents">
        <h3>Existing Documents</h3>
        <div className="document-grid">
        {renderDocumentItems()}
        </div>
      </div>
      
      {addDocPopup && (
        <Popup
          open={addDocPopup}
          closeOnDocumentClick={false}
        >
          <div className="modal">
          <button className="close" onClick={() => handlePopupClose()}>&times;</button>
            <div className="document-manager-container">
              <h1 className='form-header'>Add New Document</h1>
              <form onSubmit={handleAddSubmit} className="document-form">
                <div className="form-group">
                  <label className="label-container">Type:</label>
                  <select name="type" value={documentFields.type} onChange={handleInputChange}>
                    <option value="book">Book</option>
                    <option value="magazine">Magazine</option>
                    <option value="journal">Journal Article</option>
                  </select>
                </div>
                {/* Render document-specific fields based on selected type */}
                <div className="type-specific-fields">
                  {renderDocumentSpecificFields()}
                </div>
                {/* Submit button */}
                <button className= "submit-button" type="submit" onClick={handleAddSubmit}>Submit</button>
              </form>
            </div>
          </div>
        </Popup>
      )}

      {/* Edit Document Popup */}
      {editDocPopup && (
        <Popup
          open={editDocPopup}
          closeOnDocumentClick={false}
        >
          <div className="modal">
            <button className="close" onClick={() => handlePopupClose()}>&times;</button>
            <div className="document-manager-container">
              <h1 className='form-header'>Edit Document</h1>
              <form onSubmit={handleEditSubmit} className="document-form">
                {/* Render document-specific fields based on selected type */}
                <div className="type-specific-fields">
                  {renderDocumentSpecificFields()}
                </div>
                {/* Submit button */}
                <button className="submit-button" type="submit" onClick={handleEditSubmit}>Save Changes</button>
              </form>
            </div>
          </div>
        </Popup>
      )}

      {/* Delete Document Popup */}
      {deleteDocPopup && (
        <Popup
          open={deleteDocPopup}
          closeOnDocumentClick={false}
        >
          <div className="modal">
            <button className="close" onClick={() => handlePopupClose()}>&times;</button>
            <div className="document-manager-container">
              <h1 className='form-header'>Are you sure you want to delete this document?</h1>
              
              <button className="submit-button" type="submit" onClick={handleDeleteSubmit}>Confirm</button>
              <button className="submit-button" type="submit" onClick={handlePopupClose}>Cancel</button>
              
              
            </div>
          </div>
        </Popup>
      )}
    </>
    
  );
};

export default DocumentManager;
