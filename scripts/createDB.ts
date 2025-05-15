/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Database from 'better-sqlite3'
import { executeQuery } from '@datocms/cda-client'
import 'dotenv/config'
import { ApiResponse } from 'types'

const query = `query {
 allDepartments(first: 100) {
   name
   id
   parent {
     id
   }
 }
 allPeople(first: 100) {
   id
   name
   avatar {
     url
   }
   department {
     name
     id
   }
	title
 }
}`

const DATO_API_TOKEN = process.env.DATO_API_TOKEN

async function main() {
	const db = new Database('hashicorp.sqlite')
	db.pragma('journal_mode = WAL')

	const result = (await executeQuery(query, {
		token: DATO_API_TOKEN,
	})) as ApiResponse

	try {
		db.exec(`
			CREATE TABLE IF NOT EXISTS departments (
			name TEXT NOT NULL,
			id TEXT PRIMARY KEY,
			parent_id TEXT,
			FOREIGN KEY (parent_id) REFERENCES departments (id) ON DELETE SET NULL
			)
   		`)

		db.exec(`
			CREATE TABLE IF NOT EXISTS people (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				avatar_url TEXT,
				department_name TEXT,
				department_id TEXT NULL,
				title TEXT NOT NULL,
				FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL
			)
			`)

		const addDepartment = db.prepare(`
			INSERT OR REPLACE INTO departments (name, id, parent_id)
			VALUES (?, ?, ?)
		`)

		const addDepartments = db.transaction((departments) => {
			for (const dept of departments) {
				addDepartment.run(
					dept.name,
					dept.id,
					dept.parent ? dept.parent.id : null
				)
			}
		})

		const addPerson = db.prepare(`
			INSERT OR REPLACE INTO people (id, name, avatar_url, department_name, department_id, title)
			VALUES ($id, $name, $avatar_url, $department_name, $department_id, $title)
		`)

		const addPeople = db.transaction((people) => {
			for (const person of people) {
				let departmentId = null
				if (person.department?.id) {
					const deptExists = db
						.prepare('SELECT 1 FROM departments WHERE id = ?')
						.get(person.department.id)
					departmentId = deptExists ? person.department.id : null
				}

				addPerson.run({
					id: person.id,
					name: person.name,
					avatar_url: person.avatar?.url || null,
					department_name: person.department?.name || null,
					department_id: departmentId,
					title: person.title,
				})
			}
		})

		addDepartments(result.allDepartments)
		addPeople(result.allPeople)
	} catch (err) {
		console.error('Error adding data into database:', err)
	} finally {
		db.close()
	}
}

main()
