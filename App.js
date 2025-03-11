import React, { useState, useEffect } from 'react';
import './lib.css';

function App() {
    const [clients_be, setClients] = useState([{}]);
    const [librarian_be, setLibrarians] = useState([{}]);
    const [text, setText] = useState('');
    const [text2, setText2] = useState('');
    const [userBook, bookSearch] = useState('');
    const [user, CheckedOut] = useState('');
    const username = 'dmroz5@uic.edu'

    useEffect(() => {
        fetch("/clients")
            .then(res => res.json())
            .then(clients_be => {
                setClients(clients_be);
            });

        fetch("/librarians")
            .then(res => res.json())
            .then(librarian_be => {
                setLibrarians(librarian_be);
            });
    }, []);

    // Functions to update the text value when the buttons are clicked
    const clientHandle = () => {
        setText(clients_be.clients.map(row => row.join(' ')).join('\n')); // Modify as needed
    };

    const librarianHandle = () => {
        setText(librarian_be.librarians.map(row => row.join(' ')).join('\n')); // Modify as needed
    };

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
            <h1 className="important">Boris Bookstore</h1>
            <p>
                <button className="custom-btn btn-2" onClick={clientHandle}> I am a client</button>
            </p>
            <p>
                <button className="custom-btn btn-2" onClick={librarianHandle}> I am a librarian</button>
            </p>
            <p>
                <textarea name= "input" rows= {1} cols={24} value={userBook} onChange={(e) => bookSearch(e.target.value)}></textarea>
                <button className="custom-btn btn-2" onClick={bookToBackend}>Search</button>
            </p>
            <p>
                {text}
            </p>
            <p>
                <textarea name= "input2" rows= {1} cols={24} value={user} onChange={(e) => CheckedOut(e.target.value)}></textarea>
                <button className="custom-btn btn-2" onClick={userToBackend}>Search</button>
            </p>
            <textarea rows={20} cols={56} readOnly="true" value={text2}></textarea>

            {(typeof clients_be.clients === 'undefined') ? (
                <p>Loading...</p>
            ) : (
                clients_be.clients.map((row, i) => (
                    <div key={i}>
                        {row.map((client, j) => (
                            <span key={j}>{client}   </span>
                        ))}
                    </div>
                ))
            )}

            {(typeof librarian_be.librarians === 'undefined') ? (
                <p>Loading...</p>
            ) : (
                librarian_be.librarians.map((row, i) => (
                    <div key={i}>
                        {row.map((librarian, j) => (
                            <span key={j}>{librarian}   </span>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

export default App;
