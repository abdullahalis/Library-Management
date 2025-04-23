package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"encoding/json"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Global database connection
var db *sql.DB

// Database configuration
const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "Danielek-04282003" // Your PostgreSQL password here
	dbname   = "Library"
)

// Define the structs needed to match PostgreSQL tables
type Client struct {
	Email      string   `json:"email"`
	ClientName string   `json:"client_name"`
	Addresses  []string `json:"addresses"`
	CreditCards []CreditCard `json:"creditCards"`
}

type CreditCard struct {
	Number    string `json:"number"`
	PayAddress string `json:"payAddress"`
}

type Librarian struct {
	SSN     int    `json:"ssn"`
	LibName string `json:"lib_name"`
	Salary  int    `json:"salary"`
	Email   string `json:"email"`
}

type Book struct {
	Title      string `json:"title"`
	ISBN       int    `json:"isbn"`
	Publisher  string `json:"publisher"`
	Edition    string `json:"edition"`
	BookYear   int    `json:"book_year"`
	NumPages   int    `json:"num_pages"`
	NumCopies  int    `json:"num_copies"`
	NumAvailable int  `json:"num_available"`
}

type Magazine struct {
	ISBN      int    `json:"isbn"`
	MagName   string `json:"mag_name"`
	Publisher string `json:"publisher"`
	MagYear   int    `json:"mag_year"`
	MagMonth  int    `json:"mag_month"`
	NumCopies int    `json:"num_copies"`
	NumAvailable int `json:"num_available"`
}

type JournalArticle struct {
	JournalName string `json:"journal_name"`
	Title       string `json:"title"`
	ISBN        int    `json:"isbn"`
	Publisher   string `json:"publisher"`
	Issue       int    `json:"issue"`
	ArticleYear int    `json:"article_year"`
	ArticleNumber string `json:"article_number"`
	NumCopies   int    `json:"num_copies"`
	NumAvailable int   `json:"num_available"`
}

type Checkout struct {
	CheckoutDate string `json:"checkout_date"`
	Email        string `json:"email"`
	DocumentID   int    `json:"document_id"`
	DueDate      string `json:"due_date"`
}

type Author struct {
	ISBN   int    `json:"isbn"`
	Author string `json:"author"`
}

// Establish the database connection
func main() {
	pgConnStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	// Open database connection
	conn, err := sql.Open("postgres", pgConnStr)
	if err != nil {
		log.Fatalf("Error opening database connection: %v", err)
	}
	db = conn
	defer db.Close()

	// Ping the database to ensure connection is successful
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
	fmt.Println("Connected to the PostgreSQL database")

	// Setup routes
	http.HandleFunc("/clients", getClients)
	http.HandleFunc("/addclient", addClient)
	http.HandleFunc("/editclient", editClient)
	http.HandleFunc("/deleteclient", deleteClient)

	http.HandleFunc("/librarians", getLibrarians)
	http.HandleFunc("/bookSearch", searchBook)
	http.HandleFunc("/getbooks", getBooks)
	http.HandleFunc("/userSearch", searchUser)
	
	http.HandleFunc("/adddoc", addDocument)
	http.HandleFunc("/editdoc", editDocument)
	http.HandleFunc("/deletedoc", deleteDocument)

	http.HandleFunc("/getpayment", getPayment)
	http.HandleFunc("/addpayment", addPayment)
	http.HandleFunc("/editpayment", editPayment)
	http.HandleFunc("/deletepayment", deletePayment)

	// Start the server
	fmt.Println("Server is listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Fetch clients with associated addresses and credit cards
func getClients(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			c.client_name AS name,
			c.email AS email,
			ARRAY_AGG(DISTINCT a.address) AS addresses,
			(
				SELECT ARRAY_AGG(json_build_object('number', cc.credit_card, 'payAddress', cc.pay_address))
				FROM credit_cards cc
				WHERE cc.email = c.email
			) AS credit_cards
		FROM 
			client c
		LEFT JOIN 
			addresses a ON c.email = a.email
		GROUP BY 
			c.client_name, c.email
	`

	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching clients: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var clients []Client

	for rows.Next() {
		var name, email string
		var addresses pq.StringArray
		var creditCards []CreditCard

		err := rows.Scan(&name, &email, &addresses, &creditCards)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error scanning row: %v", err), http.StatusInternalServerError)
			return
		}

		client := Client{
			Name:        name,
			Email:       email,
			Addresses:   addresses,
			CreditCards: creditCards,
		}
		clients = append(clients, client)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(clients); err != nil {
		http.Error(w, fmt.Sprintf("Error encoding clients to JSON: %v", err), http.StatusInternalServerError)
	}
}

// Add a new client along with their credit cards and addresses
func addClient(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email    string        `json:"email"`
		Name     string        `json:"name"`
		Ccard    []CreditCard  `json:"ccard"`
		Addresses []string     `json:"addresses"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, fmt.Sprintf("Error parsing request body: %v", err), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("INSERT INTO client (email, client_name) VALUES ($1, $2)", data.Email, data.Name)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error inserting client: %v", err), http.StatusInternalServerError)
		return
	}

	for _, card := range data.Ccard {
		_, err := tx.Exec("INSERT INTO credit_cards (email, credit_card, pay_address) VALUES ($1, $2, $3)", data.Email, card.Number, card.PayAddress)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting credit card: %v", err), http.StatusInternalServerError)
			return
		}
	}

	for _, addr := range data.Addresses {
		_, err := tx.Exec("INSERT INTO addresses (email, address) VALUES ($1, $2)", data.Email, addr)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting address: %v", err), http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Delete a client along with their credit cards and addresses
func deleteClient(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, fmt.Sprintf("Error parsing request body: %v", err), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM credit_cards WHERE email = $1", data.Email)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting credit cards: %v", err), http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("DELETE FROM addresses WHERE email = $1", data.Email)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting addresses: %v", err), http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("DELETE FROM client WHERE email = $1", data.Email)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting client: %v", err), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Edit client information (update instead of delete + add)
func editClient(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email    string        `json:"email"`
		Name     string        `json:"name"`
		Ccard    []CreditCard  `json:"ccard"`
		Addresses []string     `json:"addresses"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, fmt.Sprintf("Error parsing request body: %v", err), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("UPDATE client SET client_name = $1 WHERE email = $2", data.Name, data.Email)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating client: %v", err), http.StatusInternalServerError)
		return
	}

	for _, card := range data.Ccard {
		// Check if the card already exists, if not insert it
		_, err := tx.Exec("INSERT INTO credit_cards (email, credit_card, pay_address) VALUES ($1, $2, $3) ON CONFLICT (email, credit_card) DO UPDATE SET pay_address = EXCLUDED.pay_address", data.Email, card.Number, card.PayAddress)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting/updating credit card: %v", err), http.StatusInternalServerError)
			return
		}
	}

	for _, addr := range data.Addresses {
		// Check if the address already exists, if not insert it
		_, err := tx.Exec("INSERT INTO addresses (email, address) VALUES ($1, $2) ON CONFLICT (email, address) DO NOTHING", data.Email, addr)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting address: %v", err), http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Get all librarians from the database
func getLibrarians(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT ssn, lib_name, salary, email FROM librarian")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching librarians: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var librarians []Librarian

	for rows.Next() {
		var librarian Librarian
		err := rows.Scan(&librarian.SSN, &librarian.LibName, &librarian.Salary, &librarian.Email)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error scanning row: %v", err), http.StatusInternalServerError)
			return
		}
		librarians = append(librarians, librarian)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error reading rows: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(librarians); err != nil {
		http.Error(w, fmt.Sprintf("Error encoding librarians to JSON: %v", err), http.StatusInternalServerError)
	}
}

// Search books by title
func bookSearch(w http.ResponseWriter, r *http.Request) {
	var data struct {
		SearchTerm string `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rows, err := db.Query(`
		SELECT b.isbn, b.title, a.author, b.num_copies, b.num_available
		FROM book b
		JOIN authors a ON b.isbn = a.isbn
		WHERE b.title LIKE $1`, "%"+data.SearchTerm+"%")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []map[string]interface{}
	for rows.Next() {
		var isbn, numCopies, numAvailable int
		var title, author string
		if err := rows.Scan(&isbn, &title, &author, &numCopies, &numAvailable); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		books = append(books, map[string]interface{}{
			"isbn":        isbn,
			"title":       title,
			"author":      author,
			"numCopies":   numCopies,
			"numAvailable": numAvailable,
		})
	}

	if err := rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"bookResult": books})
}

// Perform a checkout 
func checkout(w http.ResponseWriter, r *http.Request) {
	var data struct {
		User string `json:"user"`
		Book int    `json:"book"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	checkoutDate := "2024-04-23"
	dueDate := "2024-04-23"

	_, err := db.Exec(`
		INSERT INTO checkout (checkout_date, email, document_id, due_date)
		VALUES ($1, $2, $3, $4)`,
		checkoutDate, data.User, data.Book, dueDate)

	if err != nil {
		http.Error(w, fmt.Sprintf("Error performing checkout: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Search books checked out by a user
func searchUser(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email string `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `
		SELECT b.title, c.due_date
		FROM checkout c
		JOIN book b ON c.document_id = b.isbn
		JOIN client cl ON c.email = cl.email
		WHERE cl.email = $1
	`

	rows, err := db.Query(query, data.Email)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching checked-out books: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []map[string]interface{}
	for rows.Next() {
		var title, dueDate string
		if err := rows.Scan(&title, &dueDate); err != nil {
			http.Error(w, fmt.Sprintf("Error scanning row: %v", err), http.StatusInternalServerError)
			return
		}

		books = append(books, map[string]interface{}{
			"title":    title,
			"dueDate":  dueDate,
		})
	}

	if err := rows.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error reading rows: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]interface{}{"checkedOut": books}); err != nil {
		http.Error(w, fmt.Sprintf("Error encoding checked-out books to JSON: %v", err), http.StatusInternalServerError)
	}
}

// Get all books, articles, and magazines
func getBooks(w http.ResponseWriter, r *http.Request) {
	queryBooks := `
		SELECT b.title, ARRAY_AGG(a.author), b.isbn, b.publisher, b.book_year, b.edition
		FROM book b
		JOIN authors a ON b.isbn = a.isbn
		GROUP BY b.title, b.isbn, b.publisher, b.book_year, b.edition
	`

	rowsBooks, err := db.Query(queryBooks)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching books: %v", err), http.StatusInternalServerError)
		return
	}
	defer rowsBooks.Close()

	var formattedBooks []map[string]interface{}

	for rowsBooks.Next() {
		var title, publisher, edition string
		var isbn, year int
		var authors pq.StringArray

		if err := rowsBooks.Scan(&title, &authors, &isbn, &publisher, &year, &edition); err != nil {
			http.Error(w, fmt.Sprintf("Error scanning book row: %v", err), http.StatusInternalServerError)
			return
		}

		book := map[string]interface{}{
			"type":      "book",
			"title":     title,
			"authors":   authors,
			"isbn":      isbn,
			"publisher": publisher,
			"year":      year,
			"edition":   edition,
			"numPages":  "",
			"name":      "",
			"month":     "",
			"issue":     "",
			"number":    "",
		}

		formattedBooks = append(formattedBooks, book)
	}

	if err := rowsBooks.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error reading rows: %v", err), http.StatusInternalServerError)
		return
	}

	queryArticles := `
		SELECT title, ARRAY_AGG(a.author), j.isbn, j.publisher, j.issue, j.journal_name, j.article_year, j.article_number
		FROM journal_article j
		JOIN authors a ON j.isbn = a.isbn
		GROUP BY title, j.isbn, j.publisher, j.issue, j.journal_name, j.article_year, j.article_number
	`

	rowsArticles, err := db.Query(queryArticles)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching articles: %v", err), http.StatusInternalServerError)
		return
	}
	defer rowsArticles.Close()

	for rowsArticles.Next() {
		var title, publisher, issue, journalName, articleNumber string
		var isbn, articleYear int
		var authors pq.StringArray

		if err := rowsArticles.Scan(&title, &authors, &isbn, &publisher, &issue, &journalName, &articleYear, &articleNumber); err != nil {
			http.Error(w, fmt.Sprintf("Error scanning article row: %v", err), http.StatusInternalServerError)
			return
		}

		article := map[string]interface{}{
			"type":       "article",
			"title":      title,
			"authors":    authors,
			"isbn":       isbn,
			"publisher":  publisher,
			"issue":      issue,
			"name":       journalName,
			"year":       articleYear,
			"number":     articleNumber,
			"edition":    "",
			"numPages":   "",
			"month":      "",
		}

		formattedBooks = append(formattedBooks, article)
	}

	if err := rowsArticles.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error reading article rows: %v", err), http.StatusInternalServerError)
		return
	}

	queryMagazines := `SELECT isbn, mag_name, publisher, mag_year, mag_month FROM magazine`

	rowsMagazines, err := db.Query(queryMagazines)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching magazines: %v", err), http.StatusInternalServerError)
		return
	}
	defer rowsMagazines.Close()

	for rowsMagazines.Next() {
		var isbn, year, month int
		var name, publisher string

		if err := rowsMagazines.Scan(&isbn, &name, &publisher, &year, &month); err != nil {
			http.Error(w, fmt.Sprintf("Error scanning magazine row: %v", err), http.StatusInternalServerError)
			return
		}

		magazine := map[string]interface{}{
			"type":       "magazine",
			"isbn":       isbn,
			"name":       name,
			"publisher":  publisher,
			"year":       year,
			"month":      month,
			"title":      "",
			"authors":    []string{},
			"issue":      "",
			"number":     "",
			"edition":    "",
			"numPages":   "",
		}

		formattedBooks = append(formattedBooks, magazine)
	}

	if err := rowsMagazines.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error reading magazine rows: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]interface{}{"docs": formattedBooks}); err != nil {
		http.Error(w, fmt.Sprintf("Error encoding books to JSON: %v", err), http.StatusInternalServerError)
	}
}

// Add a new document (book, magazine, or article)
func addDocument(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Type       string   `json:"type"`
		Title      string   `json:"title"`
		ISBN       int      `json:"isbn"`
		Publisher  string   `json:"publisher"`
		Edition    string   `json:"edition"`
		Year       int      `json:"year"`
		Month      int      `json:"month"`
		Issue      int      `json:"issue"`
		JournalName string  `json:"journalName"`
		Number     string   `json:"number"`
		Authors    []string `json:"authors"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback() 

	switch data.Type {
	case "book":
		_, err = tx.Exec("INSERT INTO book (isbn, title, publisher, edition, book_year) VALUES ($1, $2, $3, $4, $5)", data.ISBN, data.Title, data.Publisher, data.Edition, data.Year)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting book: %v", err), http.StatusInternalServerError)
			return
		}

		for _, author := range data.Authors {
			_, err = tx.Exec("INSERT INTO authors (isbn, author) VALUES ($1, $2)", data.ISBN, author)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error inserting author: %v", err), http.StatusInternalServerError)
				return
			}
		}

	case "magazine":
		_, err = tx.Exec("INSERT INTO magazine (isbn, mag_name, publisher, mag_year, mag_month) VALUES ($1, $2, $3, $4, $5)", data.ISBN, data.Title, data.Publisher, data.Year, data.Month)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting magazine: %v", err), http.StatusInternalServerError)
			return
		}

	case "article":
		_, err = tx.Exec("INSERT INTO journal_article (isbn, journal_name, title, publisher, issue, article_year, article_number) VALUES ($1, $2, $3, $4, $5, $6, $7)", data.ISBN, data.JournalName, data.Title, data.Publisher, data.Issue, data.Year, data.Number)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting article: %v", err), http.StatusInternalServerError)
			return
		}

		for _, author := range data.Authors {
			_, err = tx.Exec("INSERT INTO authors (isbn, author) VALUES ($1, $2)", data.ISBN, author)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error inserting author: %v", err), http.StatusInternalServerError)
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Edit an existing document (book, magazine, or article)
func editDocument(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Type       string   `json:"type"`
		Title      string   `json:"title"`
		ISBN       int      `json:"isbn"`
		Publisher  string   `json:"publisher"`
		Edition    string   `json:"edition"`
		Year       int      `json:"year"`
		Month      int      `json:"month"`
		Issue      int      `json:"issue"`
		JournalName string  `json:"journalName"`
		Number     string   `json:"number"`
		Authors    []string `json:"authors"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback() 

	switch data.Type {
	case "book":
		_, err = tx.Exec("UPDATE book SET title = $1, publisher = $2, edition = $3, book_year = $4 WHERE isbn = $5", data.Title, data.Publisher, data.Edition, data.Year, data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating book: %v", err), http.StatusInternalServerError)
			return
		}

		for _, author := range data.Authors {
			_, err = tx.Exec("INSERT INTO authors (isbn, author) VALUES ($1, $2) ON CONFLICT (isbn, author) DO NOTHING", data.ISBN, author)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error inserting author: %v", err), http.StatusInternalServerError)
				return
			}
		}

	case "magazine":
		_, err = tx.Exec("UPDATE magazine SET mag_name = $1, publisher = $2, mag_year = $3, mag_month = $4 WHERE isbn = $5", data.Title, data.Publisher, data.Year, data.Month, data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating magazine: %v", err), http.StatusInternalServerError)
			return
		}

	case "article":
		_, err = tx.Exec("UPDATE journal_article SET journal_name = $1, title = $2, publisher = $3, issue = $4, article_year = $5, article_number = $6 WHERE isbn = $7", data.JournalName, data.Title, data.Publisher, data.Issue, data.Year, data.Number, data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating article: %v", err), http.StatusInternalServerError)
			return
		}

		for _, author := range data.Authors {
			_, err = tx.Exec("INSERT INTO authors (isbn, author) VALUES ($1, $2) ON CONFLICT (isbn, author) DO NOTHING", data.ISBN, author)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error inserting author: %v", err), http.StatusInternalServerError)
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Delete a document (book, magazine, or article)
func deleteDocument(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Type  string `json:"type"`
		ISBN  int    `json:"isbn"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	switch data.Type {
	case "book":
		_, err = tx.Exec("DELETE FROM authors WHERE isbn = $1", data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error deleting authors: %v", err), http.StatusInternalServerError)
			return
		}
		_, err = tx.Exec("DELETE FROM book WHERE isbn = $1", data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error deleting book: %v", err), http.StatusInternalServerError)
			return
		}

	case "magazine":
		_, err = tx.Exec("DELETE FROM magazine WHERE isbn = $1", data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error deleting magazine: %v", err), http.StatusInternalServerError)
			return
		}

	case "article":
		_, err = tx.Exec("DELETE FROM authors WHERE isbn = $1", data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error deleting authors: %v", err), http.StatusInternalServerError)
			return
		}
		_, err = tx.Exec("DELETE FROM journal_article WHERE isbn = $1", data.ISBN)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error deleting article: %v", err), http.StatusInternalServerError)
			return
		}
	}


	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Get all payment methods for a client
func getPayment(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email string `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `SELECT credit_card, pay_address FROM credit_cards WHERE email = $1`
	rows, err := db.Query(query, data.Email)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching payments: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var payments []map[string]string
	for rows.Next() {
		var number, payAddress string
		if err := rows.Scan(&number, &payAddress); err != nil {
			http.Error(w, fmt.Sprintf("Error scanning row: %v", err), http.StatusInternalServerError)
			return
		}
		payment := map[string]string{
			"number":    number,
			"payAddress": payAddress,
		}
		payments = append(payments, payment)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error reading rows: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"payments": payments})
}

// Add a new payment method (credit card) for a client
func addPayment(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email     string `json:"email"`
		Number    string `json:"number"`
		PayAddress string `json:"payAddress"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("INSERT INTO credit_cards (email, credit_card, pay_address) VALUES ($1, $2, $3)", data.Email, data.Number, data.PayAddress)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error adding payment: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Edit an existing payment method (credit card) for a client
func editPayment(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email     string `json:"email"`
		Number    string `json:"number"`
		PayAddress string `json:"payAddress"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback() 

	_, err = tx.Exec("UPDATE credit_cards SET pay_address = $1 WHERE email = $2 AND credit_card = $3", data.PayAddress, data.Email, data.Number)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating payment: %v", err), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Delete a payment method (credit card) for a client
func deletePayment(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Email  string `json:"email"`
		Number string `json:"number"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error starting transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM credit_cards WHERE email = $1 AND credit_card = $2", data.Email, data.Number)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting payment: %v", err), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, fmt.Sprintf("Error committing transaction: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}


