import Database from 'better-sqlite3'

let db: Database.Database

if (!db) {
	db = new Database('hashicorp.sqlite')
}

export default db
