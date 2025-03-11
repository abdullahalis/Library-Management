import React, { useState, useEffect } from 'react';
//import '../../Styling/SearchDocuments.css'; // Import the CSS file for styling


function SearchDocuments() {
    const [clients_be, setClients] = useState([{}]);
    const [librarian_be, setLibrarians] = useState([{}]);
    const [text, setText] = useState('');
    const [text2, setText2] = useState('');
    const [userBook, bookSearch] = useState('');
    const [user, CheckedOut] = useState('');
    const username = 'abdullah@email.com'
       


    const bookToBackend = () => {
        fetch('/bookSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: userBook }),
        })
        .then(response => response.json())
        .then(data => {  
            setText(data.bookResult.map((row, index) => (
                <div key={index}>
                    <span>{row.join(' ')}</span>
                    <button onClick={() => handleCheckoutButton(row[0])}>Checkout</button>
                </div>
            )));
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    // Separate function to handle checkout button click
    const handleCheckoutButton = (isbn) => {
        const checkoutInfo = {
            user: username,
            book: isbn
        };
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: checkoutInfo }),
        })
        .then(response => response.json())
        .then(data => {  
            // Handle the response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    const userToBackend = () => {
        fetch('/userSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: user }),
        })
        .then(response => response.json())
        .then(data => {  
            setText2(data.checkedOut.map(row => row.join(' ')).join('\n'));
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    return (
        <div className="background">
            
            <p>
                <textarea name= "input" rows= {1} cols={24} value={userBook} onChange={(e) => bookSearch(e.target.value)}></textarea>
                <button className="custom-btn btn-2" onClick={bookToBackend}>Search</button>
            </p>
            <p>
                {text}
            </p>
        </div>
    );
}


export default SearchDocuments;
