from flask import Flask, request, jsonify
import psycopg2

app = Flask(__name__)

@app.route("/members")
def members():
    return {"members": ["m1", "m2","m3"]}

def connect_to_database():
    try:
        conn = psycopg2.connect(
            dbname="Library",
            user="postgres",
            password="Danielek-04282003", #enter your password for postgres here
            host="localhost",
            port="5432"
        )
        return conn
    except psycopg2.Error as e:
        print("error connecting to db", e)
        return None
    
def close_database_connection(conn):
    try:
        if conn is not None:
            conn.close()
    except psycopg2.Error as e:
        print("Error closing database connection:", e)

def fetch_existing_clients(conn):
    try:
        cursor = conn.cursor()

        # Fetch client details along with associated addresses and credit cards
        cursor.execute("""
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

        """)

        # Fetch all rows from the query result
        rows = cursor.fetchall()

        # Format the fetched data into a list of dictionaries
        existing_clients = []
        for row in rows:
            client = {
                'name': row[0],
                'email': row[1],
                'addresses': row[2] if row[2] is not None else [],
                'creditCards': row[3] if row[3] is not None else []
            }
            existing_clients.append(client)

        return existing_clients

    except psycopg2.Error as e:
        print("Error fetching existing clients:", e)
        return []



@app.route("/clients")
def get_existing_clients():
    # Connect to the database
    connection = connect_to_database()

    if connection:
        print("connected")
        # Fetch existing clients from the database
        existing_clients = fetch_existing_clients(connection)

        # Close the database connection
        close_database_connection(connection)

        # Return the fetched clients as JSON response
        return jsonify({"clients": existing_clients})

    return jsonify([])

# #postgres DB connection
# def get_clients():
#     conn = psycopg2.connect(
#         dbname="Library",
#         user="postgres",
#         password="Danielek-04282003", #enter your password for postgres here
#         host="localhost",
#         port="5432"
#     )
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM client")
#     clients = [list(row) for row in cursor.fetchall()]
#     cursor.close()
#     conn.close()
#     return clients

# # Client API Route
# @app.route("/clients")
# def clients():
#     clients = get_clients()
#     return jsonify({"clients": clients})

def get_librarians():
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM librarian")
    librarians = [list(row) for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return librarians

# Client API Route
@app.route("/librarians")
def librarians():
    librarians = get_librarians()
    return jsonify({"librarians": librarians})

@app.route("/bookSearch", methods=['POST'])
def search_book():
    data = request.json.get('data')
    data = '%' + data + '%'
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT b.isbn, title, author, num_copies, num_available FROM book b JOIN authors a ON b.isbn = a.isbn WHERE title LIKE %s", [data])
    books = [list(row) for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify({"bookResult": books})


@app.route("/checkout", methods=['POST'])
def add_book():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )

    cursor = conn.cursor()
    cursor.execute("INSERT INTO checkout VALUES ('2024-04-23', %s, %s,'2024-04-23'::date + INTERVAL '4 WEEKS')", [data['user'], int(data['book'])])

    conn.commit()
    cursor.close()
    conn.close()

@app.route("/userSearch", methods=['POST'])
def search_user():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("select b.title, c.due_date from checkout c join book b on c.document_id = b.isbn join client cl on c.email = cl.email where cl.email = %s", [data])
    books = [list(row) for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify({"checkedOut": books})


@app.route("/addclient", methods=['POST'])
def add_client():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("insert into client values (%s, %s)", [data['email'], data['name']])
    for card in data['ccard']:
        cursor.execute("insert into credit_cards values (%s, %s, %s)", [data['email'], card['number'], card['payAddress']])
    for addy in data['addresses']:
        cursor.execute("insert into addresses values (%s, %s)", [data['email'], addy])

    conn.commit()
    cursor.close()
    conn.close() 

@app.route("/editclient", methods=['POST'])
def edit_client():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    try:
        conn.autocommit = False

        # Delete existing client record
        cursor.execute("DELETE FROM credit_cards WHERE email = %s", [data['email']])
        cursor.execute("DELETE FROM addresses WHERE email = %s", [data['email']])
        cursor.execute("DELETE FROM client WHERE email = %s", [data['email']])

        # Insert updated client information
        for card in data['ccard']:
            cursor.execute("INSERT INTO credit_cards VALUES (%s, %s, %s)", [data['email'], card['number'], card['payAddress']])
        for addy in data['addresses']:
            cursor.execute("INSERT INTO addresses VALUES (%s, %s)", [data['email'], addy])
        cursor.execute("INSERT INTO client VALUES (%s, %s)", [data['email'], data['name']])

        # Commit the transaction
        conn.commit()
    except psycopg2.Error as e:
        # Rollback the transaction if an error occurs
        conn.rollback()
        print("Error:", e)
    finally:
        # Close cursor and connection
        cursor.close()
        conn.close()

@app.route("/deleteclient", methods=['POST'])
def delete_client():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    try:
        conn.autocommit = False

        # Delete existing client record
        cursor.execute("DELETE FROM credit_cards WHERE email = %s", [data])
        cursor.execute("DELETE FROM addresses WHERE email = %s", [data])
        cursor.execute("DELETE FROM client WHERE email = %s", [data])

        # Commit the transaction
        conn.commit()
    except psycopg2.Error as e:
        # Rollback the transaction if an error occurs
        conn.rollback()
        print("Error:", e)
    finally:
        # Close cursor and connection
        cursor.close()
        conn.close()     

@app.route("/getbooks")
def get_books():
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", # enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("select title, ARRAY_AGG(a.author), b.isbn, publisher, book_year, edition from book b join authors a on b.isbn = a.isbn group by b.title, b.isbn, publisher, book_year, edition;")
    books = cursor.fetchall()

    formatted_books = []
    for book in books:
        formatted_book = {
            'type': 'book',
            'title': book[0],
            'authors': book[1],
            'isbn': book[2],
            'publisher': book[3],
            'year': book[4] if book[4] else '',
            'edition': book[5] if book[5] else '',
            'numPages': '',
            'name': '',
            'month': '',
            'issue': '',
            'number': ''
        }
        formatted_books.append(formatted_book)
    
    cursor.execute("SELECT title, ARRAY_AGG(a.author), j.isbn, publisher, issue, journal_name, article_year, article_number FROM journal_article j JOIN authors a ON j.isbn = a.isbn GROUP BY title, j.isbn, publisher, issue, journal_name, article_year, article_number;")
    articles = cursor.fetchall()
    for article in articles:
        formatted_article = {
            'type': 'article',
            'title': article[0],
            'authors': article[1],
            'isbn': article[2],
            'publisher': article[3],
            'issue': article[4] if article[4] else '',
            'name': article[5] if article[5] else '',  
            'year': article[6] if article[6] else '',
            'number': article[7] if article[7] else '',
            'edition': '',
            'numPages': '',
            'month': ''
        }
        formatted_books.append(formatted_article)
    cursor.execute("select isbn, mag_name, publisher, mag_year, mag_month from magazine")
    magazines = cursor.fetchall()
    for magazine in magazines:
        formatted_magazine = {
            'type': 'magazine',
            'isbn': magazine[0],
            'name': magazine[1],
            'publisher': magazine[2],
            'year': magazine[3] if magazine[3] else '',
            'month': magazine[4] if magazine[4] else '',
            'title': '',
            'authors': [],
            'issue': '',
            'number': '',
            'edition': '',
            'numPages': ''
        }
        formatted_books.append(formatted_magazine)

    cursor.close()
    conn.close() 
    return jsonify({"docs": formatted_books})

@app.route("/adddoc", methods=['POST'])
def add_document():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", # enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    if data['type'] == 'book':
        cursor.execute("INSERT INTO book VALUES (%s, %s, %s, %s, %s, 1, 1, 1)", 
                       (data['title'], int(data['isbn']), data['publisher'], data['edition'], int(data['year'])))
        for author in data['authors']:
            cursor.execute("INSERT INTO authors VALUES (%s, %s)", (int(data['isbn']), author))

    elif data['type'] == 'magazine':
        cursor.execute("INSERT INTO magazine VALUES (%s, %s, %s, %s, %s, 1, 1)", 
                       (int(data['isbn']), data['name'], data['publisher'], data['year'], data['month']))

    elif data['type'] == 'article':
        cursor.execute("INSERT INTO journal_article VALUES (%s, %s, %s, %s, %s, %s, %s, 1, 1)", 
                       (data['journalName'], data['title'], int(data['isbn']), data['publisher'], data['issue'], data['year'], data['number']))
        for author in data['authors']:
            cursor.execute("INSERT INTO authors VALUES (%s, %s)", (int(data['isbn']), author))

    conn.commit()
    cursor.close()
    conn.close()

@app.route("/editdoc", methods=['POST'])
def edit_document():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", # enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()


    if data['type'] == 'book':
        cursor.execute("DELETE FROM book WHERE isbn = %s", [int(data['isbn'])])
        cursor.execute("DELETE FROM authors WHERE isbn = %s", [int(data['isbn'])])

        cursor.execute("INSERT INTO book VALUES (%s, %s, %s, %s, %s, 1, 1, 1)", 
                       (data['title'], int(data['isbn']), data['publisher'], data['edition'], int(data['year'])))
        for author in data['authors']:
            cursor.execute("INSERT INTO authors VALUES (%s, %s)", (int(data['isbn']), author))

    elif data['type'] == 'magazine':
        cursor.execute("DELETE FROM magazine WHERE isbn = %s", [int(data['isbn'])])

        cursor.execute("INSERT INTO magazine VALUES (%s, %s, %s, %s, %s, 1, 1)", 
                       (int(data['isbn']), data['name'], data['publisher'], data['year'], data['month']))

    elif data['type'] == 'article':
        cursor.execute("DELETE FROM authors WHERE isbn = %s", [int(data['isbn'])])
        cursor.execute("DELETE FROM journal_article WHERE isbn = %s", [int(data['isbn'])])

        cursor.execute("INSERT INTO journal_article VALUES (%s, %s, %s, %s, %s, %s, %s, 1, 1)", 
                       (data['journalName'], data['title'], int(data['isbn']), data['publisher'], data['issue'], data['year'], data['number']))
        for author in data['authors']:
            cursor.execute("INSERT INTO authors VALUES (%s, %s)", (int(data['isbn']), author))

    conn.commit()
    cursor.close()
    conn.close()

@app.route("/deletedoc", methods=['POST'])
def delete_document():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", # enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()


    if data['type'] == 'book':
        cursor.execute("DELETE FROM book WHERE isbn = %s", [int(data['isbn'])])
        cursor.execute("DELETE FROM authors WHERE isbn = %s", [int(data['isbn'])])

    elif data['type'] == 'magazine':
        cursor.execute("DELETE FROM magazine WHERE isbn = %s", [int(data['isbn'])])

    elif data['type'] == 'article':
        cursor.execute("DELETE FROM authors WHERE isbn = %s", [int(data['isbn'])])
        cursor.execute("DELETE FROM journal_article WHERE isbn = %s", [int(data['isbn'])])

    conn.commit()
    cursor.close()
    conn.close()

@app.route("/getpayment", methods=['POST'])
def get_payment():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", # enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("select * from credit_cards where email = %s", [data])
    payments = cursor.fetchall()

    formatted_payments = [{'number': payment[1], 'payAddress': payment[2]} for payment in payments]

    cursor.close()
    conn.close() 
    return jsonify({"payments": formatted_payments})

@app.route("/addpayment", methods=['POST'])
def add_payment():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    
    cursor.execute("insert into credit_cards values (%s, %s, %s)", [data['email'], data['number'], data['payAddress']])

    conn.commit()
    cursor.close()
    conn.close()

@app.route("/editpayment", methods=['POST'])
def edit_payment():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    try:
        conn.autocommit = False

        # Delete existing client record
        cursor.execute("DELETE FROM credit_cards WHERE email = %s and credit_card = %s", [data['email'],  data['number'] ])

        # Insert updated client information
        cursor.execute("INSERT INTO credit_cards VALUES (%s, %s, %s)", [data['email'], data['number'], data['payAddress']])

        # Commit the transaction
        conn.commit()
    except psycopg2.Error as e:
        # Rollback the transaction if an error occurs
        conn.rollback()
        print("Error:", e)
    finally:
        # Close cursor and connection
        cursor.close()
        conn.close()

@app.route("/deletepayment", methods=['POST'])
def delete_payment():
    data = request.json.get('data')
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Danielek-04282003", #enter your password for postgres here
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    try:
        conn.autocommit = False

        # Delete existing client record
        cursor.execute("DELETE FROM credit_cards WHERE email = %s and credit_card = %s", [data['email'],  data['number'] ])

        # Commit the transaction
        conn.commit()
    except psycopg2.Error as e:
        # Rollback the transaction if an error occurs
        conn.rollback()
        print("Error:", e)
    finally:
        # Close cursor and connection
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)