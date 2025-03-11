CREATE TABLE librarian (
  ssn NUMERIC(9,0) PRIMARY KEY,
  lib_name VARCHAR(64) NOT NULL,
  salary NUMERIC(6,0) NOT NULL CHECK (salary >=0),
  email VARCHAR(64) NOT NULL
);

CREATE TABLE client (
    email VARCHAR(64) PRIMARY KEY NOT NULL, 
    client_name VARCHAR(64) NOT NULL
);

CREATE TABLE addresses (
    email VARCHAR(64) NOT NULL,
    address VARCHAR(128) NOT NULL,
    PRIMARY KEY (email, address)
);

CREATE TABLE credit_cards (
    email VARCHAR(64) NOT NULL,
    credit_card VARCHAR(128) NOT NULL,
    PRIMARY KEY (email, credit_card)
);

CREATE TABLE checkout (
    checkout_date DATE,
    email VARCHAR(64),
    document_id NUMERIC(8,0) UNIQUE,
    due_date DATE,
    PRIMARY KEY (checkout_date, email, document_id),
    CONSTRAINT chk_due_after_checkout
        CHECK (due_date > checkout_date)
);
CREATE TABLE magazine(
  isbn NUMERIC(8,0) PRIMARY KEY, 
  mag_name VARCHAR(128) NOT NULL,
  publisher VARCHAR(128) NOT NULL,
  mag_year NUMERIC(4,0) NOT NULL,
  mag_month NUMERIC(2,0) NOT NULL CHECK (mag_month >=1 and mag_month <= 12),
  num_copies NUMERIC(4,0) NOT NULL CHECK (num_copies >=1),
  num_available NUMERIC(4,0) NOT NULL CHECK (num_available >= 0),
  CONSTRAINT inventory CHECK (num_copies >= num_available),
  CONSTRAINT fk_checkout FOREIGN KEY (isbn) REFERENCES checkout(document_id)
);

CREATE TABLE book (
  title VARCHAR(128) NOT NULL,
  isbn NUMERIC(8,0) PRIMARY KEY,
  publisher VARCHAR(128) NOT NULL,
  edition VARCHAR(32),
  book_year NUMERIC(4,0) NOT NULL,
  num_pages NUMERIC(4,0) NOT NULL CHECK (num_pages > 0),
  num_copies NUMERIC(4,0) NOT NULL CHECK (num_copies >=1),
  num_available NUMERIC(4,0) NOT NULL CHECK (num_available >= 0),
  CONSTRAINT inventory CHECK (num_copies >= num_available),
  CONSTRAINT fk_checkout FOREIGN KEY (isbn) REFERENCES checkout(document_id)
);

CREATE TABLE journal_article (
  journal_name VARCHAR(128) NOT NULL,
  title VARCHAR(128) NOT NULL,
  isbn NUMERIC(8,0) PRIMARY KEY,
  publisher VARCHAR(128) NOT NULL,
  issue NUMERIC(3,0),
  article_year NUMERIC(4,0) NOT NULL,
  article_number VARCHAR(30),
  num_copies NUMERIC(4,0) NOT NULL CHECK (num_copies >=1),
  num_available NUMERIC(4,0) NOT NULL CHECK (num_available >= 0),
  CONSTRAINT inventory CHECK (num_copies >= num_available),
  CONSTRAINT fk_checkout FOREIGN KEY (isbn) REFERENCES checkout(document_id)
);

CREATE TABLE authors(
  isbn NUMERIC(8,0) NOT NULL,
  author VARCHAR(128) NOT NULL,
  PRIMARY KEY (isbn, author)
);
