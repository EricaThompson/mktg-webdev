/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { PersonRecord } from 'types'
import Database from 'better-sqlite3'
import 'dotenv/config'

type ResponseData = {
	results: PersonRecord[]
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	const { query } = req
	const searchParam = (query.search as string) || ''

	try {
		const db = new Database('hashicorp.sqlite', { verbose: console.log })
		const isDepartmentId = !isNaN(Number(searchParam))
		let statement = null

		if (searchParam === '') {
			statement = db.prepare(`
			SELECT *
			FROM people
		`)
		} else {
			if (isDepartmentId) {
				statement = db.prepare(`
					SELECT *
					FROM people
					WHERE department_id = ? 
				`)
			} else {
				statement = db.prepare(`
					SELECT *
					FROM people
					WHERE name LIKE '%' || ? || '%' 
				`)
			}
		}

		const results =
			searchParam === ''
				? (statement.all() as PersonRecord)
				: (statement.all(searchParam) as PersonRecord[])

		db.close()

		res.status(200).json({ results })
	} catch (err) {
		console.error('Query failed:', err)
		res.status(500).json({ results: [] })
	}
}
