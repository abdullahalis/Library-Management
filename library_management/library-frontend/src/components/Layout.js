import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav>
        <h1> Boris Bookstore</h1>
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
        <p> Librarian</p>
        <ul>
          <li>
            <Link to="/librarian/document-manager">Manage Documents</Link>
          </li>
          <li>
            <Link to="/librarian/client-manager">Manage Clients</Link>
          </li>
        </ul>
        <p> Client</p>
        <ul>
          <li>
            <Link to="/client/payments">Manage Payments</Link>
          </li>
          <li>
            <Link to="/client/search-documents">Search Documents</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;