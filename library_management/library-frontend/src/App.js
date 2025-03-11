import React, { useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Layout from './components/Layout'
import Registration from './components/Auth/Registration';
import Login from './components/Auth/Login';
import DocumentManager from './components/Librarian/DocumentManager';
import ClientManager from './components/Librarian/ClientManager';
import Payments from './components/Client/Payments';
import SearchDocuments from './components/Client/SearchDocuments';
// import BorrowedDocuments from './components/Client/BorrowedDocuments';

function App() {

  // const [data,setData] = useState([{}])

  // useEffect(() => {
  //   fetch("/members").then(
  //     res => res.json()
  //   ).then(
  //     data => {
  //       setData(data)
  //       console.log(data)
  //     }
  //   )
  // })
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />}  />
          <Route path="/librarian/document-manager" element={<DocumentManager />} />
          <Route path="/librarian/client-manager" element={<ClientManager />} />
          <Route path="/client/payments" element={<Payments />} />
          <Route path="/client/search-documents" element={<SearchDocuments />} />
          {/* <Route path="/client/borrowed-documents" element={BorrowedDocuments} /> */}
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;